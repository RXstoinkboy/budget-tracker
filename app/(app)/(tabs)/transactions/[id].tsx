import { Form, Spinner, YStack, ScrollView } from 'tamagui';
import { useForm, FormProvider } from 'react-hook-form';
import { useGetTransactionDetails, useUpdateTransaction } from '@/features/transactions/api/query';
import { DatePicker } from '@/components/date-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { InputField } from '@/components/input-field';
import { SelectField } from '@/components/select-field';
import { TextAreaField } from '@/components/text-area-field';
import { RadioGroup, RadioGroupOption } from '@/components/radio-group';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/button';
import { TransactionDto } from '@/features/transactions/api/types';
import { useCallback, useEffect } from 'react';
import { useGetCategories } from '@/features/categories/api/query';

// TODO: reuse between this and create
const expenseItems: RadioGroupOption[] = [
    { label: 'Expense', value: 'true' },
    { label: 'Income', value: 'false' },
];

const mapTransactionToForm = (transaction: TransactionDto) => ({
    name: transaction.name,
    amount: transaction.amount.toString(),
    description: transaction.description,
    category_id: transaction.category_id,
    expense: transaction.expense.toString(),
    transaction_date: DateTime.fromISO(transaction.transaction_date),
});

// TODO: reuse between this and create
const TransactionFormSchema = z.object({
    name: z.string().min(1),
    // TODO: improve it even more to format the text on the fly (like Cleave)
    amount: z.string().regex(/^\d+(\.\d{0,2})?$/),
    description: z.string().nullable(),
    category_id: z.string().nullable(),
    expense: z.string().regex(/^(true|false)$/),
    transaction_date: z.custom<DateTime>((val) => val instanceof DateTime),
});

type TransactionFormType = z.infer<typeof TransactionFormSchema>;

export default function EditTransaction() {
    const { id } = useLocalSearchParams();
    const idString = id as string;
    const transactionDetails = useGetTransactionDetails(idString);
    const categories = useGetCategories();

    const getDefaultCategoryId = useCallback(
        (type: string = 'expense') => {
            const category = categories.data?.list.find((cat) => cat.default && cat.type === type);
            return category?.id;
        },
        [categories.data?.list],
    );

    const methods = useForm<TransactionFormType>({
        defaultValues: mapTransactionToForm(transactionDetails.data!),
        resolver: zodResolver(TransactionFormSchema),
    });
    const expense = methods.watch('expense');
    const type = expense === 'true' ? 'expense' : 'income';
    const categoriesOptions = (categories.data?.selectOptions.all ?? []).map((opt) => {
        return {
            ...opt,
            meta: {
                ...opt.meta,
                hidden: opt.meta.type !== type,
            },
        };
    });

    const navigateToTransactionsList = () => router.push('/(app)/(tabs)/transactions');

    const updateTransaction = useUpdateTransaction({
        onMutate: navigateToTransactionsList,
    });

    const onSubmit = methods.handleSubmit((data) => {
        updateTransaction.mutate({
            id: idString,
            ...data,
            amount: Number(data.amount),
            expense: data.expense === 'true',
            receipt_url: null,
            transaction_date: data.transaction_date.toISODate() || DateTime.now().toISODate(),
        });
    });

    useEffect(() => {
        if (transactionDetails.data) {
            methods.reset(mapTransactionToForm(transactionDetails.data));
        }
    }, [transactionDetails.data, methods]);

    useEffect(() => {
        methods.resetField('category_id', {
            defaultValue: getDefaultCategoryId(type) ?? null,
        });
    }, [getDefaultCategoryId, methods, type]);

    // TODO: add the code automatically update category when changing expense

    if (transactionDetails.isLoading) {
        return <Spinner size={'large'} />;
    }
    // TODO: when in a styling phase then make the whole form a reusable component and resue it across create and edit
    return (
        <FormProvider {...methods}>
            <ScrollView keyboardShouldPersistTaps="handled">
                <YStack>
                    <Form gap="$2" onSubmit={onSubmit}>
                        <InputField
                            label="Name"
                            placeholder="Name"
                            autoFocus
                            controller={{ name: 'name', rules: { required: true } }}
                        />
                        {/* TODO: should be text but accept numbers and later sum equasions */}
                        {/* TODO: or actually it might still accept only numbers but there can be separate button "+" to add next number */}
                        <InputField
                            label="Amount"
                            placeholder="Amount"
                            type="number"
                            controller={{ name: 'amount', rules: { required: true } }}
                        />
                        <RadioGroup options={expenseItems} controller={{ name: 'expense' }} />
                        <DatePicker label="Date" controller={{ name: 'transaction_date' }} />
                        <SelectField
                            label="Category"
                            options={categoriesOptions}
                            placeholder="Select category"
                            controller={{
                                name: 'category_id',
                            }}
                        />
                        <TextAreaField
                            label="Description"
                            placeholder="Description"
                            controller={{ name: 'description' }}
                        />
                        <Form.Trigger
                            asChild
                            disabled={updateTransaction.isPending || !methods.formState.isValid}>
                            <Button icon={updateTransaction.isPending ? <Spinner /> : undefined}>
                                Save
                            </Button>
                        </Form.Trigger>
                    </Form>
                </YStack>
            </ScrollView>
        </FormProvider>
    );
}
