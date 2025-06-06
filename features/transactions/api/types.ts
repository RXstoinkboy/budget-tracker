export type TransactionDto = {
    id: string;
    name: string;
    amount: number;
    description: string | null;
    transaction_date: string;
    receipt_url: string | null;
    expense: boolean;
    category_id: string | null;
};

export type CreateTransactionDto = Omit<TransactionDto, 'id'>;
export type UpdateTransactionDto = TransactionDto;

export type TransactionFilters = {
    period: 'current_month' | 'last_month';
};

export type TransactionsListResponse = {
    transaction_date: string;
    transactions: TransactionDto[];
}[];
