export interface Transaction {
    trans_id: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    dateTime: string;
    category: string;
    user_id: number;  
}

export interface FilteredTransaction {
    description: string;
    type: 'income' | 'expense';
    amount: number;
    amountDirection: 'greater' | 'less' | 'equal';
    dateTime: string;
    dateDirection: 'before' | 'after' | 'on';
    category: Array<string>;
    user_id: number;  
}