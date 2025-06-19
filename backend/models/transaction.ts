export interface Transaction {
    trans_id: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    dateTime: string;
    category: string;
    user_id: number;  
}