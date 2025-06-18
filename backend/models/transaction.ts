export interface Transaction {
    description: string;
    type: 'income' | 'expense';
    amount: number;
    dateTime: string;
    category: string;    
}