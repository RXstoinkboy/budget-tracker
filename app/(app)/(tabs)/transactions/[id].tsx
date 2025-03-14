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
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/button';
import { useCategoriesOptions } from '@/features/transactions/hooks/use-categories-options';
import { TransactionFormType, TransactionFormSchema } from '@/features/transactions/schema';
import { mapTransactionToForm } from '@/features/transactions/utils';

// TODO: reuse between this and create
const expenseItems: RadioGroupOption[] = [
    { label: 'Expense', value: 'true' },
    { label: 'Income', value: 'false' },
];

export default function EditTransaction() {
    const { id } = useLocalSearchParams();
    const idString = id as string;
    const transactionDetails = useGetTransactionDetails(idString);
    const { categoriesOptions, updateCategoriesData } = useCategoriesOptions(
        transactionDetails.data?.expense?.toString(),
    );

    const methods = useForm<TransactionFormType>({
        defaultValues: mapTransactionToForm(transactionDetails.data!),
        resolver: zodResolver(TransactionFormSchema),
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
