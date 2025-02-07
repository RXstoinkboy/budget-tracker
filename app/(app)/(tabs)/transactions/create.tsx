import { Button, Form, Spinner, YStack, ScrollView } from 'tamagui';
import { useForm, FormProvider } from 'react-hook-form';
import { useCreateTransaction } from '@/features/transactions/api/query';
import { DatePicker } from '@/components/date-picker';
import { router } from 'expo-router';
import { TransactionDto } from '@/features/transactions/api/types';
import { InputField } from '@/components/input-field';
import { SelectField, SelectOption } from '@/components/select-field';
import { TextAreaField } from '@/components/text-area-field';
import { RadioGroup, RadioGroupOption } from '@/components/radio-group';

// TODO: fetch categories from API
const categories: SelectOption[] = [
    { name: 'Category 1', value: 'category1' },
    { name: 'Category 2', value: 'category2' },
    { name: 'Category 3', value: 'category3' },
];

const expenseItems: RadioGroupOption[] = [
    { label: 'Expense', value: 'true' },
    { label: 'Income', value: 'false' },
];

type TransactionFormType = Omit<TransactionDto, 'amount'> & {
    amount: string;
};

// TODO: add react hook form
export default function CreateTransaction() {
    const isLoading = false;
    // TODO: form validation needed
    const methods = useForm<TransactionFormType>({
        // TODO: form validation with zod
        // TODO: error handling for fields
        defaultValues: {
            name: '',
            amount: '',
            description: '',
            category_id: null,
            expense: true,
            transaction_date: new Date(),
        },
    });

    const navigateToTransactionsList = () => router.push('/(app)/(tabs)/transactions');

    const createTransaction = useCreateTransaction({
        onMutate: (newTransaction) => {
            navigateToTransactionsList();
        },
    });

    const onSubmit = methods.handleSubmit((data) => {
        createTransaction.mutate({ ...data, amount: Number(data.amount) });
    });
    return (
        <FormProvider {...methods}>
            <ScrollView keyboardShouldPersistTaps="handled">
                <YStack>
                    <Form gap="$2" onSubmit={onSubmit}>
                        <InputField label="Name" placeholder="Name" controller={{ name: 'name' }} />
                        {/* TODO: should be text but accept numbers and later sum equasions */}
                        <InputField
                            label="Amount"
                            placeholder="Amount"
                            type="number"
                            controller={{ name: 'amount' }}
                        />
                        <RadioGroup options={expenseItems} controller={{ name: 'expense' }} />
                        <DatePicker label="Date" controller={{ name: 'transaction_date' }} />
                        <SelectField
                            label="Category"
                            options={categories}
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
                        <Form.Trigger asChild disabled={isLoading}>
                            <Button icon={isLoading ? <Spinner /> : undefined}>Submit</Button>
                        </Form.Trigger>
                    </Form>
                </YStack>
            </ScrollView>
        </FormProvider>
    );
}
