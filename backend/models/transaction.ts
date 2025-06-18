export interface Transaction {
    id: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    dateTime: string;
    category: string;    
}