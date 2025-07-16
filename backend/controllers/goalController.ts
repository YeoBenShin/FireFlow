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
      
    console.log("Supabase query result:");
    console.log("- Data:", data);
    console.log("- Error:", error);
    console.log("- Data length:", data?.length || 0);
      
    if (error) {
      console.error("Supabase error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    res.status(200).json(data);
  
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
 
// Controller to create a new goal
export const createGoal = async (req: Request, res: Response) => {
  console.log("Received request body:", req.body);
  const user_id = (req.user as jwt.JwtPayload).sub;
  
  // Extract selectedFriends before adding to goal data
  const { selectedFriends = [], ...goalData } = req.body;
  goalData.user_id = user_id;

  try {
    // Create the goal first (without selectedFriends)
    const { data: createdGoal, error: goalError } = await supabase
      .from('goal')
      .insert(goalData)
      .select()
      .single();

    if (goalError) {
      throw goalError;
    }

    // Create goal participant entry for the owner
    const ownerParticipant = {
      goal_id: createdGoal.goal_id,
      user_id: user_id,
      role: 'owner',
      allocated_amount: 0
    };

    const { error: ownerError } = await supabase
      .from('goal_participants')
      .insert(ownerParticipant);

    if (ownerError) {
      // Rollback: delete the goal if owner participant creation fails
      await supabase.from('goal').delete().eq('goal_id', createdGoal.goal_id);
      throw ownerError;
    }

    // If it's collaborative and has selected friends, add them as participants
    if (goalData.isCollaborative && selectedFriends.length > 0) {
      const collaboratorParticipants = selectedFriends.map((friendId: string) => ({
        goal_id: createdGoal.goal_id,
        user_id: friendId,
        role: 'collaborator',
        allocated_amount: 0
      }));

      const { error: collaboratorsError } = await supabase
        .from('goal_participants')
        .insert(collaboratorParticipants);

      if (collaboratorsError) {
        console.error("Failed to add collaborators:", collaboratorsError);
        // Don't rollback the goal, just log the error
        // The owner can manually add collaborators later
      }
    }

    res.status(201).json({ 
      message: "Goal created successfully", 
      data: createdGoal,
      participants: selectedFriends.length + 1 // owner + collaborators
    });
  } catch (error: any) {
    console.error("Supabase insert error:", error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

  export const updateGoal = async (req: Request, res: Response) => {
    try {
      const {goal_id, ...updateFields} = req.body;
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

  // Controller to get all goals with participant information
export const getGoalsWithParticipants = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  console.log("=== GET GOALS WITH PARTICIPANTS DEBUG ===");
  console.log("User ID from JWT:", user_id);
  
  try {
    // Get goals where user is either owner or participant
    console.log("Querying goal_participants table...");
    const { data, error } = await supabase
      .from('goal_participants')
      .select(`
        goal_id,
        role,
        allocated_amount,
        goal:goal_id (
          goal_id,
          title,
          category,
          description,
          status,
          amount,
          target_date,
          isCollaborative,
          user_id
        )
      `)
      .eq('user_id', user_id)
      .order('goal(target_date)', { ascending: true });
      
    console.log("Goal participants query result:");
    console.log("- Data:", JSON.stringify(data, null, 2));
    console.log("- Error:", error);
    console.log("- Data length:", data?.length || 0);
      
    if (error) {
      console.error("Supabase error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    // Get participant counts for each goal
    const goalIds = data?.map(item => item.goal_id) || [];
    console.log("Goal IDs found:", goalIds);
    
    if (goalIds.length === 0) {
      console.log("No goal participants found - returning empty array");
      res.status(200).json([]);
      return;
    }

    const { data: participantCounts, error: countError } = await supabase
      .from('goal_participants')
      .select('goal_id, user_id')
      .in('goal_id', goalIds);

    if (countError) {
      console.error("Participant count error:", countError);
      throw countError;
    }

    console.log("Participant counts:", participantCounts);

    // Group participant counts by goal_id
    const participantCountMap = participantCounts?.reduce((acc, participant) => {
      acc[participant.goal_id] = (acc[participant.goal_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    // Enhance the data with participant counts
    const enhancedData = data?.map(item => ({
      ...item,
      goal: {
        ...item.goal,
        participantCount: participantCountMap[item.goal_id] || 1
      }
    }));

    console.log("Final enhanced data:", JSON.stringify(enhancedData, null, 2));
    res.status(200).json(enhancedData);
  } catch (error) {
    console.error("Error fetching goals with participants:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

// Controller to get detailed participant information for collaborative goals
export const getGoalParticipants = async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const user_id = (req.user as jwt.JwtPayload).sub;
  
  try {
    // Get participants for this goal
    const { data, error } = await supabase
      .from('goal_participants')
      .select('goal_id, user_id, role, allocated_amount')
      .eq('goal_id', goalId);

    if (error) {
      console.error("Error fetching goal participants:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Check if the requesting user is a participant
    const userIsParticipant = data.some(participant => participant.user_id === user_id);
    if (!userIsParticipant) {
      res.status(403).json({ error: "Access denied to this goal" });
      return;
    }

    // Get user details for all participants
    const userIds = data.map(p => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('user_id, name')
      .in('user_id', userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
      throw usersError;
    }

    // Combine participant and user data
    const enrichedParticipants = data.map(participant => {
      const user = users?.find(u => u.user_id === participant.user_id);
      return {
        goal_id: participant.goal_id,
        user_id: participant.user_id,
        role: participant.role,
        allocated_amount: participant.allocated_amount,
        user: user || { name: 'Unknown User' }
      };
    });

    res.status(200).json(enrichedParticipants);
  } catch (error) {
    console.error("Error fetching goal participants:", error);
    res.status(500).json({ error: "Failed to fetch goal participants" });
  }
};

