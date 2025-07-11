

export interface Goal {
    goal_id: number; // Supabase generates this UUID
    user_id: string; // Supabase handles this via RLS or explicit assignment
    title: string;
    description?: string;
    category: string;
    due_date: string; // ISO string format 'YYYY-MM-DD'
    status: 'pending' | 'in-progress' | 'completed';
  }