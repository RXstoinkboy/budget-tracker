import {
    Button,
    Form,
    Spinner,
    YStack,
    RadioGroup,
    XStack,
    Label,
    SizeTokens,
    Input,
    TextArea,
    Select,
    SelectProps,
    InputProps,
    TextAreaProps,
    Adapt,
    ScrollView,
    Sheet,
    useMedia,
} from 'tamagui';
import {
    useForm,
    useFormContext,
    Controller,
    ControllerProps,
    FieldValues,
    FormProvider,
} from 'react-hook-form';
import { transactionsKeys, useCreateTransaction } from '@/features/transactions/api/query';
import { DatePicker } from '@/components/date-picker';
import { router } from 'expo-router';
import { TransactionDto } from '@/features/transactions/api/types';
import { useQueryClient } from '@tanstack/react-query';

export function RadioGroupItemWithLabel(props: { size: SizeTokens; value: string; label: string }) {
    const id = `radiogroup-${props.value}`;
    return (
        <XStack width={300} gap="$4">
            <RadioGroup.Item value={props.value} id={id} size={props.size}>
                <RadioGroup.Indicator />
            </RadioGroup.Item>

            <Label size={props.size} htmlFor={id}>
                {props.label}
            </Label>
        </XStack>
    );
}

// TODO: maybe change it to ToggleGroup
// TODO: add some default value and some useful props
export function IsExpenseController() {
    const { control } = useFormContext<TransactionFormType>();

    // TODO: make it more generic
    return (
        <Controller
            control={control}
            name="expense"
            render={({ field: { value, onChange } }) => {
                const normalizedValue = value.toString();
                return (
                    <RadioGroup
                        aria-labelledby="Select one item"
                        name="form"
                        value={normalizedValue}
                        onValueChange={onChange}>
                        <XStack gap="$2">
                            <RadioGroupItemWithLabel size="$3" value={'true'} label="Expense" />
                            <RadioGroupItemWithLabel size="$4" value={'false'} label="Income" />
                        </XStack>
                    </RadioGroup>
                );
            }}
        />
    );
}

// TODO: defaultValue, type (numeric | date | text | password),
// TODO: onChange, value, disabled, required, min,
type InputFieldProps<T extends FieldValues> = Omit<ControllerProps<T>, 'render'> &
    InputProps & {
        type?: 'text' | 'password' | 'number';
        label?: string;
        placeholder?: string;
    };
export function InputField<T extends FieldValues>(props: InputFieldProps<T>) {
    const { control } = useFormContext<T>();
    return (
        <YStack>
            {props.label && <Label htmlFor={props.name}>{props.label}</Label>}
            <Controller
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        id={props.name}
                        placeholder={props.placeholder}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={props.type === 'password'}
                        keyboardType={props.type === 'number' ? 'numeric' : 'default'}
                        {...props}
                    />
                )}
                name={props.name}
            />
            {/* {errors.firstName && <Text>This is required.</Text>} */}
        </YStack>
    );
}

type TextAreaFieldProps<T extends FieldValues> = Omit<ControllerProps<T>, 'render'> &
    TextAreaProps & {
        label?: string;
        name: string;
        placeholder?: string;
    };

export const TextAreaField = <T extends FieldValues>({
    name,
    label,
    ...props
}: TextAreaFieldProps<T>) => {
    const { control } = useFormContext<T>();

    return (
        <YStack>
            {label && <Label htmlFor={name}>{label}</Label>}
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                    <TextArea
                        id={name}
                        placeholder={props.placeholder}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
        </YStack>
    );
};

// TODO: do the same with extending tamagui props for other components
type SelectItemValue = FieldValues & {
    name: string;
    value: string;
};

type SelectItemProps<T extends FieldValues> = SelectProps &
    Omit<ControllerProps<T>, 'render'> & {
        items: SelectItemValue[];
        placeholder?: string;
    };

const SelectItem = <T extends FieldValues>({
    name,
    placeholder,
    items,
    ...props
}: SelectItemProps<T>) => {
    const { control } = useFormContext<T>();
    const media = useMedia();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Select value={value} onValueChange={onChange} disablePreventBodyScroll>
                    <Select.Trigger>
                        <Select.Value placeholder={placeholder} />
                    </Select.Trigger>
                    <Adapt when={media.sm} platform="touch">
                        <Sheet modal dismissOnSnapToBottom native animation="medium">
                            {/* TODO: make it so it doesn't cover whole screen (?) */}
                            {/* TODO:  pass ....props somewhere*/}
                            {/* TODO: check if it works correctly with react hook form */}
                            <Sheet.Frame>
                                <Sheet.ScrollView>
                                    <Adapt.Contents />
                                </Sheet.ScrollView>
                            </Sheet.Frame>
                            <Sheet.Overlay />
                        </Sheet>
                    </Adapt>
                    <Select.Content>
                        <Select.Viewport>
                            {items.map((option, index) => (
                                <Select.Item index={index} key={option.value} value={option.value}>
                                    <Select.ItemText>{option.name}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select>
            )}
        />
    );
};

type SelectFieldProps<T extends FieldValues> = Omit<ControllerProps<T>, 'render'> &
    SelectItemProps<T> & {
        // TODO: improve to use generic type instead of any
        label?: string;
    };

const categories: SelectItemValue[] = [
    { name: 'Category 1', value: 'category1' },
    { name: 'Category 2', value: 'category2' },
    { name: 'Category 3', value: 'category3' },
];

export const SelectField = <T extends FieldValues>({
    label,
    name,
    ...props
}: SelectFieldProps<T>) => {
    return (
        <YStack>
            {label && (
                <Label htmlFor={name} flex={1} minW={80}>
                    {label}
                </Label>
            )}
            <SelectItem id={name} name={name} {...props} />
        </YStack>
    );
};

export function CategorySelect() {
    return (
        <SelectField
            label="Category"
            items={categories}
            placeholder="Select category"
            name="category_id"
        />
    );
}

type TransactionFormType = TransactionDto & {
    amount: string;
};

// TODO: add react hook form
export default function CreateTransaction() {
    const isLoading = false;
    // TODO: form validation needed
    const methods = useForm<TransactionFormType>({
        // TODO: default values in other const
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

    const queryClient = useQueryClient();
    const createTransaction = useCreateTransaction({
        onMutate: (newTransaction) => {
            queryClient.setQueryData(transactionsKeys.lists(), (oldData) => {
                return {
                    ...oldData,
                    data: [...oldData.data, newTransaction],
                };
            });
            navigateToTransactionsList();
        },
        // perfomr optimistic update on transactions list
    });

    const onSubmit = methods.handleSubmit((data) => {
        createTransaction.mutate({ ...data, amount: Number(data.amount) });
    });
    return (
        <FormProvider {...methods}>
            <ScrollView>
                <YStack>
                    <Form gap="$2" onSubmit={onSubmit}>
                        <InputField label="Name" placeholder="Name" name="name" />
                        {/* TODO: should be text but accept numbers and later sum equasions */}
                        <InputField
                            label="Amount"
                            placeholder="Amount"
                            name="amount"
                            type="number"
                        />
                        <IsExpenseController />
                        <DatePicker name="transaction_date" label="Date" />
                        <CategorySelect />
                        <TextAreaField
                            label="Description"
                            placeholder="Description"
                            name="description"
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
