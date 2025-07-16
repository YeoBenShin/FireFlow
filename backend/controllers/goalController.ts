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

    // If it's collaborative and has selected friends, send them invitations
    if (goalData.isCollaborative && selectedFriends.length > 0) {
      const invitationParticipants = selectedFriends.map((friendId: string) => ({
        goal_id: createdGoal.goal_id,
        user_id: friendId,
        role: 'pending', // Start as pending invitation
        allocated_amount: 0
      }));

      const { error: invitationsError } = await supabase
        .from('goal_participants')
        .insert(invitationParticipants);

      if (invitationsError) {
        console.error("Failed to send invitations:", invitationsError);
        // Don't rollback the goal, just log the error
        // The owner can manually send invitations later
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
    // Get goals where user is either owner or participant (including pending)
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
      .select('goal_id, user_id, role')
      .in('goal_id', goalIds)
      .neq('role', 'pending'); // Only count active participants (owner + collaborator)

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
    // Get participants for this goal - convert goalId to number
    const { data, error } = await supabase
      .from('goal_participants')
      .select('goal_id, user_id, role, allocated_amount')
      .eq('goal_id', parseInt(goalId));

    if (error) {
      console.error("Error fetching goal participants:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Check if the requesting user is a participant
    const userParticipant = data.find(participant => participant.user_id === user_id);
    if (!userParticipant) {
      res.status(403).json({ error: "Access denied to this goal" });
      return;
    }

    // If user is not the owner, filter out pending participants
    let filteredData = data;
    if (userParticipant.role !== 'owner') {
      filteredData = data.filter(participant => participant.role !== 'pending');
    }

    // Get user details for all participants (use filtered data)
    const userIds = filteredData.map(p => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('user_id, name')
      .in('user_id', userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
      throw usersError;
    }

    // Combine participant and user data (use filtered data)
    const enrichedParticipants = filteredData.map(participant => {
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

// Get pending invitations for the current user
export const getPendingInvitations = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;

  try {
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
          user_id,
          user:user_id (
            name
          )
        )
      `)
      .eq('user_id', user_id)
      .eq('role', 'pending')
      .order('goal(target_date)', { ascending: true });

    if (error) {
      console.error("Error fetching pending invitations:", error);
      throw error;
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({ error: "Failed to fetch pending invitations" });
  }
};

// Accept a goal invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  const { goalId } = req.params;

  console.log("=== ACCEPT INVITATION DEBUG ===");
  console.log("User ID:", user_id);
  console.log("Goal ID (raw):", goalId);
  console.log("Goal ID (parsed):", parseInt(goalId));

  try {
    // Update the participant role from 'pending' to 'collaborator' - convert goalId to number
    const { data, error } = await supabase
      .from('goal_participants')
      .update({ role: 'collaborator' })
      .eq('goal_id', parseInt(goalId))
      .eq('user_id', user_id)
      .eq('role', 'pending')
      .select();

    console.log("Update query result:");
    console.log("- Data:", data);
    console.log("- Error:", error);

    if (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No invitation found to accept");
      return res.status(404).json({ error: "Invitation not found or already processed" });
    }

    // Ensure the goal is marked as collaborative since someone accepted an invitation
    const { error: updateGoalError } = await supabase
      .from('goal')
      .update({ isCollaborative: true })
      .eq('goal_id', parseInt(goalId));

    if (updateGoalError) {
      console.error("Error updating goal to collaborative:", updateGoalError);
      // Don't throw error, invitation was still accepted successfully
    } else {
      console.log("Successfully ensured goal is marked as collaborative");
    }

    console.log("Invitation accepted successfully:", data);
    res.status(200).json({ message: "Invitation accepted successfully", data: data[0] });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
};

// Reject a goal invitation
export const rejectInvitation = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  const { goalId } = req.params;

  console.log("=== REJECT INVITATION DEBUG ===");
  console.log("User ID:", user_id);
  console.log("Goal ID (raw):", goalId);
  console.log("Goal ID (parsed):", parseInt(goalId));

  try {
    console.log("Starting goal deletion process...");
    
    // Step 1: Delete ALL participants for this goal (owner, collaborators, pending - everyone)
    const { data: deletedParticipants, error: deleteParticipantsError } = await supabase
      .from('goal_participants')
      .delete()
      .eq('goal_id', parseInt(goalId))
      .select();

    console.log("Participants deletion result:");
    console.log("- Data:", deletedParticipants);
    console.log("- Error:", deleteParticipantsError);

    if (deleteParticipantsError) {
      console.error("Error deleting goal participants:", deleteParticipantsError);
      console.error("Full error details:", JSON.stringify(deleteParticipantsError, null, 2));
      throw deleteParticipantsError;
    }

    console.log("Successfully deleted participants:", deletedParticipants?.length || 0);

    // Step 2: Delete the goal itself
    const { data: deletedGoal, error: deleteGoalError } = await supabase
      .from('goal')
      .delete()
      .eq('goal_id', parseInt(goalId))
      .select();

    console.log("Goal deletion result:");
    console.log("- Data:", deletedGoal);
    console.log("- Error:", deleteGoalError);

    if (deleteGoalError) {
      console.error("Error deleting goal:", deleteGoalError);
      console.error("Full error details:", JSON.stringify(deleteGoalError, null, 2));
      throw deleteGoalError;
    }

    if (!deletedGoal || deletedGoal.length === 0) {
      console.log("No goal found to delete - it may have already been deleted");
      return res.status(404).json({ error: "Goal not found or already deleted" });
    }

    console.log("Goal completely deleted successfully");
    res.status(200).json({ 
      message: "Goal invitation rejected - entire goal deleted", 
      deletedGoal: deletedGoal[0],
      deletedParticipants: deletedParticipants || []
    });
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    res.status(500).json({ error: "Failed to reject invitation" });
  }
};

