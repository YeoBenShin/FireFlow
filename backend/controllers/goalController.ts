import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Goal } from '../models/goal'; 
import jwt from 'jsonwebtoken';

export const getAllGoals = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  try {
    const { data, error } = await supabase
      .from('goal')
      .select('*')
      .eq('user_id', user_id)
      .order('target_date', {ascending: true });
      
    if (error) {
      throw error;
    }

    // Calculate progress for each goal
    const goalsWithProgress = data.map(goal => {
      const originalAmount = goal.original_amount || goal.amount;
      const allocatedAmount = originalAmount - goal.amount;
      const progress = originalAmount > 0 ? (allocatedAmount / originalAmount) * 100 : 0;
      
      return {
        ...goal,
        progress: Math.round(progress),
        allocated_amount: allocatedAmount,
        original_amount: originalAmount
      };
    });

    res.status(200).json(goalsWithProgress);
  
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
 
// Controller to create a new goal
export const createGoal = async (req: Request, res: Response) => {
  console.log("Received request body:", req.body);
  req.body.user_id = (req.user as jwt.JwtPayload).sub;
  
  // Set original_amount to the initial amount for progress tracking
  if (req.body.amount && !req.body.original_amount) {
    req.body.original_amount = req.body.amount;
  }
  
  const newGoal = req.body;
    try {
      const {data, error} = await supabase.from('goal').insert(newGoal).select();
      if(error){
        throw error;
      }
      res.status(201).json({ message: "Goal created", data: newGoal });
    } catch (error: any) {
        console.error("Supabase insert error:", error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
  };

  export const updateGoal = async (req: Request, res: Response) => {
    try {
      const { goal_id, ...updateFields } = req.body;
      const { data, error } = await supabase.from('goal').update(updateFields).eq('goal_id', goal_id).select('*');
      if (error) {
        throw error;
      } else if (data.length === 0) {
        res.status(404).json({ error: 'goal not found' });
      }
      return; 
    } catch (error) {
      res.status(500).json({ error: 'Failed to update goal' });
    }
  };

  // Controller to delete a goal by ID for the authenticated user
  export const deleteGoal = async (req: Request, res: Response) => {

    try {
      const { goal_id } = req.body;
      console.log("Recieve goal_id:", goal_id);
      const {data, error} = await supabase.from('goal').delete().eq('goal_id', goal_id).select('*');
      if (error) {
          throw error;
      }
      else if(data.length == 0){
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete goal'});
    }
  };

  // Controller to allocate money to goals
  export const allocateToGoals = async (req: Request, res: Response) => {
    const user_id = (req.user as jwt.JwtPayload).sub;
    const { allocations } = req.body; // Expected format: { goalId: amount, goalId2: amount2, ... }
    
    try {
      // Start a transaction-like operation
      const results = [];
      
      for (const [goalId, allocationAmount] of Object.entries(allocations)) {
        if (typeof allocationAmount !== 'number' || allocationAmount <= 0) {
          continue; // Skip invalid allocations
        }
        
        // Get current goal data
        const { data: goalData, error: fetchError } = await supabase
          .from('goal')
          .select('amount, original_amount, user_id, isCollaborative, status')
          .eq('goal_id', goalId)
          .single();
          
        if (fetchError || !goalData) {
          throw new Error(`Goal ${goalId} not found`);
        }
        
        // Check if user owns the goal or if it's collaborative
        if (goalData.user_id !== user_id && !goalData.isCollaborative) {
          throw new Error(`Unauthorized to allocate to goal ${goalId}`);
        }
        
        // Check if allocation amount exceeds remaining target
        if ((allocationAmount as number) > goalData.amount) {
          throw new Error(`Allocation for goal ${goalId} exceeds remaining target amount`);
        }
        
        // Calculate new remaining amount
        const newRemainingAmount = goalData.amount - (allocationAmount as number);
        
        // Update the goal - reduce the target amount by the allocated amount
        const { data: updateData, error: updateError } = await supabase
          .from('goal')
          .update({ 
            amount: newRemainingAmount,
            status: newRemainingAmount <= 0 ? 'completed' : 'in-progress'
          })
          .eq('goal_id', goalId)
          .select();
          
        if (updateError) {
          throw updateError;
        }
        
        // If it's a collaborative goal, also update/create goal_participant entry
        if (goalData.isCollaborative) {
          const { data: participantData, error: participantFetchError } = await supabase
            .from('goal_participants')
            .select('allocatedAmount')
            .eq('goal_id', goalId)
            .eq('user_id', user_id)
            .single();
            
          if (participantFetchError && participantFetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw participantFetchError;
          }
          
          if (participantData) {
            // Update existing participant
            const newAllocatedAmount = (participantData.allocatedAmount || 0) + (allocationAmount as number);
            await supabase
              .from('goal_participants')
              .update({ allocatedAmount: newAllocatedAmount })
              .eq('goal_id', goalId)
              .eq('user_id', user_id);
          } else {
            // Create new participant entry
            await supabase
              .from('goal_participants')
              .insert({
                goal_id: goalId,
                user_id: user_id,
                role: goalData.user_id === user_id ? 'owner' : 'collaborator',
                allocatedAmount: allocationAmount
              });
          }
        }
        
        results.push({
          goalId,
          allocatedAmount: allocationAmount,
          newRemainingAmount,
          success: true
        });
      }
      
      res.status(200).json({ 
        message: "Allocations completed successfully", 
        results 
      });
      
    } catch (error: any) {
      console.error("Allocation error:", error);
      res.status(500).json({ 
        error: error.message || 'Failed to allocate funds to goals' 
      });
    }
  };

