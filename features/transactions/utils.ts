import { DateTime } from 'luxon';
import { TransactionDto } from './api/types';

export const mapTransactionToForm = (transaction: TransactionDto) => ({
    name: transaction.name,
    amount: transaction.amount.toString(),
    description: transaction.description,
    category_id: transaction.category_id,
    expense: transaction.expense.toString(),
    transaction_date: DateTime.fromISO(transaction.transaction_date),
});
