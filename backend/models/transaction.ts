export interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    dateTime: string;
    type: 'income' | 'expense';
}