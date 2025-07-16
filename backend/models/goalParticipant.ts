

export interface GoalParticipant {
    goal_id: number; // Supabase generates this UUID
    user_id: string; // User ID of the participant
    role: 'owner' | 'collaborator' | 'pending'; // pending for invitation
    allocated_amount: number; // Amount of savings allocated by the participant towards the goal
  }