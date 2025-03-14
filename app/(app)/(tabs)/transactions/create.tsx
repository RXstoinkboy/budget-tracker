import { Form, Spinner, YStack, ScrollView } from 'tamagui';
import { useForm, FormProvider } from 'react-hook-form';
import { useCreateTransaction } from '@/features/transactions/api/query';
import { DatePicker } from '@/components/date-picker';
import { router } from 'expo-router';
import { InputField } from '@/components/input-field';
import { SelectField } from '@/components/select-field';
import { TextAreaField } from '@/components/text-area-field';
import { RadioGroup, RadioGroupOption } from '@/components/radio-group';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/button';
import { useGetCategories } from '@/features/categories/api/query';
import { useCategoriesOptions } from '@/features/transactions/hooks/use-categories-options';

const expenseItems: RadioGroupOption[] = [
    { label: 'Expense', value: 'true' },
    { label: 'Income', value: 'false' },
];

const TransactionFormSchema = z.object({
    name: z.string().min(1),
    amount: z.string().regex(/^[0-9]+$/),
    description: z.string().nullable(),
    category_id: z.string().nullable(),
    expense: z.string().regex(/^(true|false)$/),
    transaction_date: z.custom<DateTime>((val) => val instanceof DateTime),
});

type TransactionFormType = z.infer<typeof TransactionFormSchema>;

export default function CreateTransaction() {
    const { data } = useGetCategories();
    const { categoriesOptions, updateCategoriesData, getDefaultCategoryId } =
        useCategoriesOptions();

    const methods = useForm<TransactionFormType>({
        defaultValues: {
            description: null,
            expense: 'true',
            category_id: getDefaultCategoryId(data?.list ?? []),
            transaction_date: DateTime.now(),
        },
        resolver: zodResolver(TransactionFormSchema),
    });

    const navigateToTransactionsList = () => router.push('/(app)/(tabs)/transactions');

    const createTransaction = useCreateTransaction({
        onMutate: navigateToTransactionsList,
    });

    const onSubmit = methods.handleSubmit((data) => {
        createTransaction.mutate({
            ...data,
            amount: Number(data.amount),
            expense: data.expense === 'true',
            receipt_url: null,
            transaction_date: data.transaction_date.toISODate() || DateTime.now().toISODate(),
        });
    });

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
                        <RadioGroup
                            options={expenseItems}
                            controller={{ name: 'expense' }}
                            onValueChange={updateCategoriesData(methods.resetField)}
                        />
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
                            disabled={createTransaction.isPending || !methods.formState.isValid}>
                            <Button icon={createTransaction.isPending ? <Spinner /> : undefined}>
                                Submit
                            </Button>
                        </Form.Trigger>
                    </Form>
                </YStack>
            </ScrollView>
        </FormProvider>
    );
}
