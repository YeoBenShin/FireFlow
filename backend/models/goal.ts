

export interface Goal {
    goal_id: number; // Supabase generates this UUID
    title: string;
    category: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    amount: number;
    target_date: string; // ISO string format 'YYYY-MM-DD'
    isCollaborative: boolean; // Indicates if the goal is collaborative
    user_id: string; // User ID of the owner
  }