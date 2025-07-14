

export interface GoalParticipant {
    goalId: number; // Supabase generates this UUID
    userId: string; // User ID of the participant
    role: 'owner' | 'collaborator'; 
    allocatedAmount: number; // Amount of savings allocated by the participant towards the goal
  }