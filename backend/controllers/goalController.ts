import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Goal } from '../models/goals'; 

export const getAllGoals = async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('Goal').select('*');
      
      if (error) {
        throw error;
      }
      res.status(200).json(data);
  
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  };

  
// Controller to create a new goal
export const createGoal = async (req: Request, res: Response) => {
    const newGoal: Goal = req.body;
  
    try {
      const {data, error} = await supabase.from('Goal').insert(newGoal);
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
      const {id, ...updateFields}: Goal = req.body;
      const { data, error } = await supabase.from('goal').update(updateFields).eq('id', id).select('*');
      if (error) {
        throw error;
      } else if (data.length === 0) {
        res.status(404).json({ error: 'goal not found' });
      }
      
      res.status(200).json(data);
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to update goal' });
    }
  };
   
  // Controller to delete a goal by ID for the authenticated user
  export const deleteGoal = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const success = await goalService.deleteGoal(id, userId);
      if (!success) {
          // This case might be hit if the service threw an error internally for a different reason
          // or if RLS prevented the deletion without an explicit Supabase error code.
          // For simplicity, we assume if no error from service, it's successful.
          return res.status(404).json({ error: 'Goal not found or could not be deleted' });
      }
      res.status(204).send(); // 204 No Content for successful deletion
    } catch (error: any) {
      console.error('Error in deleteGoal controller:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };

