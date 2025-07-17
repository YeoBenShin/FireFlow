

export interface Goal {
    goal_id: number; // Supabase generates this UUID
    title: string;
    category: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    amount: number;
    target_date: string; // ISO string format 'YYYY-MM-DD'
    user_id: string; // User ID of the owner
    current_amount?: number; // Current allocated amount
    participantCount?: number; // Number of participants
    userRole?: 'owner' | 'collaborator' | 'pending'; // User's role in this goal
  }