import { Request, Response } from 'express';
import { supabase } from "../db/supabaseClient";
import { Goal } from '../models/goal'; 
import jwt from 'jsonwebtoken';

export const getAllGoals = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;

  try {
    // Get goals where user is owner
    const { data: ownedGoals, error: ownedError } = await supabase
      .from('goal')
      .select('*')
      .eq('user_id', user_id)
      .order('target_date', {ascending: true });
      
    if (ownedError) {
      console.error("Error fetching owned goals:", ownedError);
      throw ownedError;
    }

    // Get goals where user is a participant (including pending)
    const { data: participantGoals, error: participantError } = await supabase
      .from('goal_participants')
      .select(`
        role,
        goal:goal_id (
          goal_id,
          title,
          category,
          description,
          status,
          amount,
          target_date,
          user_id
        )
      `)
      .eq('user_id', user_id);

    if (participantError) {
      console.error("Error fetching participant goals:", participantError);
      throw participantError;
    }

    // Combine owned goals and participant goals
    const allGoals = [...(ownedGoals || [])];
    
    // Add participant goals (flatten the structure)
    participantGoals?.forEach(participant => {
      if (participant.goal) {
        const goalWithRole = {
          ...participant.goal,
          userRole: participant.role
        };
        allGoals.push(goalWithRole);
      }
    });

    // Remove duplicates (in case user is both owner and participant)
    const uniqueGoals = allGoals.filter((goal, index, self) => 
      index === self.findIndex(g => g.goal_id === goal.goal_id)
    );

    console.log("Combined goals result:");
    console.log("- Owned goals:", ownedGoals?.length || 0);
    console.log("- Participant goals:", participantGoals?.length || 0);
    console.log("- Unique goals:", uniqueGoals.length);

    // Get participant counts for each goal (including pending)
    const goalIds = uniqueGoals.map(goal => goal.goal_id);
    const { data: participantCounts, error: participantCountError } = await supabase
      .from('goal_participants')
      .select('goal_id')
      .in('goal_id', goalIds);

    if (participantCountError) {
      console.error("Error fetching participant counts:", participantCountError);
    }

    // Count participants per goal (including pending)
    const participantCountMap: { [key: number]: number } = {};
    participantCounts?.forEach(participant => {
      participantCountMap[participant.goal_id] = (participantCountMap[participant.goal_id] || 0) + 1;
    });

    // Get current amounts for each goal
    const { data: allocations, error: allocationError } = await supabase
      .from('goal_participants')
      .select('goal_id, allocated_amount')
      .in('goal_id', goalIds);

    if (allocationError) {
      console.error("Error fetching allocations:", allocationError);
    }

    console.log("Raw allocation data:", allocations);

    // Calculate current amounts per goal
    const currentAmountMap: { [key: number]: number } = {};
    allocations?.forEach(allocation => {
      const goalId = allocation.goal_id;
      const amount = allocation.allocated_amount || 0;
      currentAmountMap[goalId] = (currentAmountMap[goalId] || 0) + amount;
    });

    // Merge the data
    const goalsWithExtendedInfo = uniqueGoals.map(goal => ({
      ...goal,
      current_amount: currentAmountMap[goal.goal_id] || 0,
      participantCount: participantCountMap[goal.goal_id] || 1,
      userRole: goal.userRole || 'owner' // Default to owner if not set
    }));

    res.status(200).json(goalsWithExtendedInfo);
  
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

// Add this function to your existing goalController.ts

export const getCurrentAmounts = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  console.log("=== GET CURRENT AMOUNTS DEBUG ===");
  console.log("User ID from JWT:", user_id);

  try {
    // Get all goals where user is the owner
    const { data: ownedGoals, error: ownedError } = await supabase
      .from('goal')
      .select('goal_id')
      .eq('user_id', user_id);

    if (ownedError) {
      console.error("Error fetching owned goals:", ownedError);
      throw ownedError;
    }

    if (!ownedGoals || ownedGoals.length === 0) {
      console.log("No owned goals found");
      res.status(200).json({});
      return;
    }

    const goalIds = ownedGoals.map(goal => goal.goal_id);
    console.log("Found goal IDs:", goalIds);

    // Get total allocated amounts for each goal by summing all participants' contributions
    const { data: participants, error: participantsError } = await supabase
      .from('goal_participants')
      .select('goal_id, allocated_amount')
      .in('goal_id', goalIds);

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }

    console.log("Participants data:", participants);

    // Calculate total allocated amount per goal
    const currentAmounts: { [key: string]: number } = {};
    
    // Initialize all goals with 0
    goalIds.forEach(goalId => {
      currentAmounts[goalId] = 0;
    });

    // Sum up allocated amounts from all participants for each goal
    participants?.forEach(participant => {
      const goalId = participant.goal_id;
      currentAmounts[goalId] = (currentAmounts[goalId] || 0) + (participant.allocated_amount || 0);
    });

    console.log("Current amounts calculated:", currentAmounts);
    res.status(200).json(currentAmounts);

  } catch (error) {
    console.error("Error fetching current amounts:", error);
    res.status(500).json({ error: "Failed to fetch current amounts" });
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

    // If there are selected friends, send them invitations
    if (selectedFriends.length > 0) {
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
      .in('goal_id', goalIds);
      // Include all participants (owner + collaborator + pending)

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

    // Get total allocated amounts for each goal
    const allGoalIds = data?.map(item => item.goal_id) || [];
    const { data: allAllocations, error: allocationError } = await supabase
      .from('goal_participants')
      .select('goal_id, allocated_amount')
      .in('goal_id', allGoalIds);

    if (allocationError) {
      console.error("Error fetching all allocations:", allocationError);
    }

    // Calculate current amounts per goal
    const currentAmountMap: { [key: number]: number } = {};
    allAllocations?.forEach(allocation => {
      const goalId = allocation.goal_id;
      const amount = allocation.allocated_amount || 0;
      currentAmountMap[goalId] = (currentAmountMap[goalId] || 0) + amount;
    });

    // Enhance the data with participant counts and current amounts
    const enhancedData = data?.map(item => ({
      ...item,
      goal: {
        ...item.goal,
        participantCount: participantCountMap[item.goal_id] || 1,
        current_amount: currentAmountMap[item.goal_id] || 0
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

    // Show all participants with their actual roles (owner, collaborator, pending)
    let filteredData = data;

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

// Add this function to handle new allocations

export const allocateToGoals = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;
  const { allocations } = req.body; // { goalId: amount, goalId2: amount2, ... }

  console.log("=== ALLOCATE TO GOALS DEBUG ===");
  console.log("User ID:", user_id);
  console.log("Allocations:", allocations);

  try {
    // Validate input
    if (!allocations || typeof allocations !== 'object') {
      res.status(400).json({ error: "Invalid allocations data" });
      return;
    }

    const allocationEntries = Object.entries(allocations).filter(([_, amount]) => Number(amount) > 0);
    
    if (allocationEntries.length === 0) {
      res.status(400).json({ error: "No valid allocations provided" });
      return;
    }

    const completedGoals: number[] = [];

    // Process each allocation
    for (const [goalId, amount] of allocationEntries) {
      console.log(`\n=== PROCESSING ALLOCATION ===`);
      console.log(`Goal ID: ${goalId}, Amount: ${amount}, User: ${user_id}`);
      
      // Check if user is already a participant in this goal
      const { data: existingParticipant, error: checkError } = await supabase
        .from('goal_participants')
        .select('*')
        .eq('goal_id', parseInt(goalId))
        .eq('user_id', user_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error(`Error checking participant for goal ${goalId}:`, checkError);
        throw checkError;
      }

      console.log(`Existing participant found:`, existingParticipant ? 'Yes' : 'No');

      if (existingParticipant) {
        // Update existing participant's allocated amount
        const oldAmount = existingParticipant.allocated_amount || 0;
        const newAmount = oldAmount + Number(amount);
        
        console.log(`Updating existing participant for goal ${goalId}:`);
        console.log(`  - Old amount: ${oldAmount}`);
        console.log(`  - Additional amount: ${amount}`);
        console.log(`  - New total amount: ${newAmount}`);
        
        const { error: updateError } = await supabase
          .from('goal_participants')
          .update({ allocated_amount: newAmount })
          .eq('goal_id', parseInt(goalId))
          .eq('user_id', user_id);

        if (updateError) {
          console.error(`Error updating allocation for goal ${goalId}:`, updateError);
          throw updateError;
        }

        console.log(`✅ Successfully updated allocation for goal ${goalId}: ${oldAmount} -> ${newAmount}`);
      } else {
        // Create new participant entry (set role to 'collaborator' if it's not the owner)
        const { data: goalData, error: goalError } = await supabase
          .from('goal')
          .select('user_id')
          .eq('goal_id', parseInt(goalId))
          .single();

        if (goalError) {
          console.error(`Error fetching goal data for goal ${goalId}:`, goalError);
          throw goalError;
        }

        const role = goalData.user_id === user_id ? 'owner' : 'collaborator';

        console.log(`Creating new participant for goal ${goalId}:`);
        console.log(`  - User ID: ${user_id}`);
        console.log(`  - Role: ${role}`);
        console.log(`  - Amount: ${amount}`);

        const { error: insertError } = await supabase
          .from('goal_participants')
          .insert({
            goal_id: parseInt(goalId),
            user_id: user_id,
            role: role,
            allocated_amount: Number(amount)
          });

        if (insertError) {
          console.error(`Error creating participant for goal ${goalId}:`, insertError);
          throw insertError;
        }

        console.log(`✅ Successfully created new participant for goal ${goalId} with amount ${amount} and role ${role}`);
      }

      // Check if goal is now completed
      // Get the goal's target amount
      const { data: goalData, error: goalError } = await supabase
        .from('goal')
        .select('amount, status')
        .eq('goal_id', parseInt(goalId))
        .single();

      if (goalError) {
        console.error(`Error fetching goal for completion check:`, goalError);
        continue; // Don't fail the whole operation, just continue
      }

      // Calculate total allocated amount for this goal
      const { data: allParticipants, error: participantsError } = await supabase
        .from('goal_participants')
        .select('allocated_amount')
        .eq('goal_id', parseInt(goalId));

      if (participantsError) {
        console.error(`Error fetching participants for completion check:`, participantsError);
        continue; // Don't fail the whole operation, just continue
      }

      const totalAllocated = allParticipants?.reduce((sum, participant) => 
        sum + (participant.allocated_amount || 0), 0) || 0;

      console.log(`\n=== GOAL COMPLETION CHECK ===`);
      console.log(`Goal ${goalId}:`);
      console.log(`  - Target amount: ${goalData.amount}`);
      console.log(`  - Total allocated: ${totalAllocated}`);
      console.log(`  - Current status: ${goalData.status}`);
      console.log(`  - All participants:`, allParticipants);

      // If goal is completed and status isn't already 'completed'
      if (totalAllocated >= goalData.amount && goalData.status !== 'completed') {
        const { error: updateStatusError } = await supabase
          .from('goal')
          .update({ 
            status: 'completed'
          })
          .eq('goal_id', parseInt(goalId));

        if (updateStatusError) {
          console.error(`Error updating goal status to completed:`, updateStatusError);
        } else {
          console.log(`Goal ${goalId} marked as completed!`);
          completedGoals.push(parseInt(goalId));
        }
      } else if (goalData.status === 'pending' && totalAllocated > 0) {
        // Update status from pending to in-progress when first allocation is made
        const { error: updateStatusError } = await supabase
          .from('goal')
          .update({ 
            status: 'in-progress'
          })
          .eq('goal_id', parseInt(goalId));

        if (updateStatusError) {
          console.error(`Error updating goal status to in-progress:`, updateStatusError);
        } else {
          console.log(`Goal ${goalId} marked as in-progress!`);
        }
      }
    }

    console.log("All allocations processed successfully");
    
    // Return updated goal information for the allocated goals
    const updatedGoals = [];
    console.log("Fetching updated goal data for allocated goals...");
    
    for (const goalId of Object.keys(allocations)) {
      try {
        const { data: goalData, error: goalError } = await supabase
          .from('goal')
          .select('*')
          .eq('goal_id', parseInt(goalId))
          .single();

        if (!goalError && goalData) {
          // Get total allocated amount for this goal
          const { data: allParticipants, error: participantsError } = await supabase
            .from('goal_participants')
            .select('allocated_amount')
            .eq('goal_id', parseInt(goalId));

          if (!participantsError) {
            const totalAllocated = allParticipants?.reduce((sum, participant) => 
              sum + (participant.allocated_amount || 0), 0) || 0;
            
            console.log(`Goal ${goalId} updated: ${totalAllocated}/${goalData.amount}`);
            
            updatedGoals.push({
              ...goalData,
              current_amount: totalAllocated
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching updated data for goal ${goalId}:`, error);
      }
    }

    console.log("Final allocation result:", {
      allocations,
      completedGoals,
      updatedGoalsCount: updatedGoals.length
    });

    res.status(200).json({ 
      message: "Allocations processed successfully",
      allocations: allocations,
      completedGoals: completedGoals,
      updatedGoals: updatedGoals
    });

  } catch (error) {
    console.error("Error processing allocations:", error);
    res.status(500).json({ error: "Failed to process allocations" });
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
    // Only delete the current user's participation record
    const { data: deletedParticipant, error: deleteParticipantError } = await supabase
      .from('goal_participants')
      .delete()
      .eq('goal_id', parseInt(goalId))
      .eq('user_id', user_id)
      .eq('role', 'pending')
      .select();

    console.log("Participant deletion result:");
    console.log("- Data:", deletedParticipant);
    console.log("- Error:", deleteParticipantError);

    if (deleteParticipantError) {
      console.error("Error deleting goal participant:", deleteParticipantError);
      throw deleteParticipantError;
    }

    if (!deletedParticipant || deletedParticipant.length === 0) {
      console.log("No pending invitation found to reject");
      return res.status(404).json({ error: "Invitation not found or already processed" });
    }

    // Check if there are any remaining participants after rejection
    const { data: remainingParticipants, error: remainingError } = await supabase
      .from('goal_participants')
      .select('user_id, role')
      .eq('goal_id', parseInt(goalId));

    if (remainingError) {
      console.error("Error checking remaining participants:", remainingError);
      throw remainingError;
    }

    console.log("Remaining participants:", remainingParticipants);

    // If no participants remain, the goal automatically becomes a personal goal
    // (participantCount will be 1 when only the owner remains)
    const participantCount = remainingParticipants?.length || 0;
    console.log("Participant count after rejection:", participantCount);

    console.log("Invitation rejected successfully");
    res.status(200).json({ 
      message: "Goal invitation rejected successfully", 
      deletedParticipant: deletedParticipant[0],
      remainingParticipants: participantCount
    });
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    res.status(500).json({ error: "Failed to reject invitation" });
  }
};

// Debug endpoint to check database state
export const debugDatabase = async (req: Request, res: Response) => {
  const user_id = (req.user as jwt.JwtPayload).sub;

  try {
    console.log("=== DATABASE DEBUG FOR USER:", user_id, "===");

    // Get all goals for this user
    const { data: goals, error: goalsError } = await supabase
      .from('goal')
      .select('*')
      .eq('user_id', user_id);

    // Get all goal participants for this user
    const { data: participants, error: participantsError } = await supabase
      .from('goal_participants')
      .select('*')
      .eq('user_id', user_id);

    // Get all goal participants for all goals this user owns
    const goalIds = goals?.map(g => g.goal_id) || [];
    const { data: allParticipants, error: allParticipantsError } = await supabase
      .from('goal_participants')
      .select('*')
      .in('goal_id', goalIds);

    console.log("User's goals:", goals);
    console.log("User's participations:", participants);
    console.log("All participants in user's goals:", allParticipants);

    res.status(200).json({
      user_id,
      goals: goals || [],
      userParticipations: participants || [],
      allParticipants: allParticipants || []
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: "Debug failed" });
  }
};

