export type TransactionDto = {
    id: string;
    name: string;
    amount: number;
    description: string | null;
    transaction_date: string;
    receiptUrl: string | null;
    expense: boolean;
    category_id: string | null;
};

export type TransactionFilters = {
    order_by_desc?: boolean;
};

export type TransactionListResponse = {
    transaction_date: string;
    transactions: TransactionDto[];
}[];
