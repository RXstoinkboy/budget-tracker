import { DateTime } from 'luxon';
import * as z from 'zod';

export const TransactionFormSchema = z.object({
    name: z.string().min(1),
    // TODO: improve it even more to format the text on the fly (like Cleave)
    amount: z.string().regex(/^\d+(\.\d{0,2})?$/),
    description: z.string().nullable(),
    category_id: z.string().nullable(),
    expense: z.string().regex(/^(true|false)$/),
    transaction_date: z.custom<DateTime>((val) => val instanceof DateTime),
});

export type TransactionFormType = z.infer<typeof TransactionFormSchema>;
