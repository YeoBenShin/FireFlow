export interface Transaction {
    transId: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    dateTime: string;
    category: string;
    userId: string;  
}

export interface FilteredTransaction {
    description: string;
    type: 'income' | 'expense';
    amount: number;
    amountDirection: 'greater' | 'less' | 'equal';
    dateTime: string;
    dateDirection: 'before' | 'after' | 'on';
    category: Array<string>;
    userId: string;  
    numOfTrx: number;
}