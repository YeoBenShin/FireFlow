export interface RecurringTransaction {
    recTransId: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;    
    frequency: 'daily' | 'weekly' | 'biweekly' | 'bimonthly' | 'monthly' | 'yearly';
    repeatDay: string; // Day of the week to repeat the transaction (eg. monday, tuesday, wednesday..)
    endDate?: string; // Optional, if the recurring transaction has an end date
    isActive: boolean; // Indicates if the recurring transaction is currently active
    userId: number;
}