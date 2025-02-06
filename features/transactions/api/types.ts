export type TransactionDto = {
    name: string;
    amount: number;
    description: string | null;
    transaction_date: Date | null;
    receiptUrl: string | null;
    expense: boolean;
    category_id: string | null;
};
