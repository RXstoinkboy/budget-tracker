import { Button } from '@/components/button';
import { DeleteConfirmation, DeleteConfirmationProps } from '@/components/delete-confirmation';
import { InputField } from '@/components/input-field';
import { SelectField } from '@/components/select-field';
import { Sheet } from '@/components/sheet';
import { TextAreaField } from '@/components/text-area-field';
import { icons } from '@/consts/icons';
import {
    DEFAULT_FILTERS,
    useCreateBudget,
    useDeleteBudget,
    useEditBudget,
    useGetBudgetList,
} from '@/features/budget/api/query';
import { BudgetDto } from '@/features/budget/api/types';
import { useAvailableBudgetCategories } from '@/features/budget/hooks/use-available-budget-categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, ChevronLeft, ChevronRight, Plus, Trash } from '@tamagui/lucide-icons';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    Text,
    ListItem,
    ScrollView,
    XStack,
    YStack,
    H4,
    Form,
    XGroup,
    YGroup,
    Separator,
} from 'tamagui';
import { z } from 'zod';

const BudgetFormSchema = z.object({
    start_date: z.custom<DateTime>((val) => val instanceof DateTime),
    end_date: z.custom<DateTime>((val) => val instanceof DateTime),
    description: z.string(),
    category_id: z.string(),
    amount: z.string().regex(/^[0-9]+$/),
});

type BudgetFormType = z.infer<typeof BudgetFormSchema>;

type CreateBudgetFormProps = {
    autoFocus?: boolean;
    onSubmit: () => void;
};

export const CreateBudgetForm = (props: CreateBudgetFormProps) => {
    const createBudget = useCreateBudget({
        onMutate: () => {
            props.onSubmit();
        },
    });
    const categoriesOptions = useAvailableBudgetCategories();
    const startOfMonth = DateTime.now().startOf('month');
    const endOfMonth = DateTime.now().endOf('month');

    const methods = useForm<BudgetFormType>({
        defaultValues: {
            description: '',
            category_id: categoriesOptions[0]?.value,
            // TODO: there is no period selection at the moment so I am using current month
            start_date: startOfMonth,
            end_date: endOfMonth,
            amount: '',
        },
        resolver: zodResolver(BudgetFormSchema),
    });

    const onSubmit = methods.handleSubmit((data) => {
        createBudget.mutate({
            ...data,
            amount: Number(data.amount),
            start_date: data.start_date.toISODate() ?? startOfMonth.toISODate(),
            end_date: data.end_date.toISODate() ?? endOfMonth.toISODate(),
        });
    });

    return (
        <FormProvider {...methods}>
            <YStack gap="$4" p={'$2'}>
                <H4>Add budget</H4>

                <Form onSubmit={onSubmit} gap={'$2'}>
                    <InputField
                        type="number"
                        label="Amount"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'amount', rules: { required: true } }}
                    />
                    <SelectField
                        label="Category"
                        options={categoriesOptions}
                        controller={{
                            name: 'category_id',
                        }}
                    />
                    <TextAreaField label="Description" controller={{ name: 'description' }} />
                    <Form.Trigger asChild disabled={!methods.formState.isValid}>
                        <Button>Add to list</Button>
                    </Form.Trigger>
                </Form>
            </YStack>
        </FormProvider>
    );
};

export const useCreateBudgetSheet = () => {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        setIsOpen,
        close,
        open,
    };
};

type EditBudgetFormProps = {
    autoFocus?: boolean;
    onSubmit: () => void;
    budget: BudgetDto;
};

export const EditBudgetForm = (props: EditBudgetFormProps) => {
    const editBudget = useEditBudget({
        onMutate: () => {
            props.onSubmit();
        },
    });
    const categoriesOptions = useAvailableBudgetCategories();
    const startOfMonth = DateTime.now().startOf('month');
    const endOfMonth = DateTime.now().endOf('month');

    const methods = useForm<BudgetFormType>({
        defaultValues: {
            description: '',
            category_id: categoriesOptions[0]?.value,
            // TODO: there is no period selection at the moment so I am using current month
            start_date: startOfMonth,
            end_date: endOfMonth,
            amount: '',
        },
        resolver: zodResolver(BudgetFormSchema),
    });

    const onSubmit = methods.handleSubmit((data) => {
        editBudget.mutate({
            ...data,
            amount: Number(data.amount),
            start_date: data.start_date.toISODate() ?? startOfMonth.toISODate(),
            end_date: data.end_date.toISODate() ?? endOfMonth.toISODate(),
            id: props.budget?.id ?? '',
        });
    });

    useEffect(() => {
        methods.reset({
            ...props.budget,
            amount: String(props.budget.amount),
            start_date: DateTime.fromISO(props.budget.start_date),
            end_date: DateTime.fromISO(props.budget.end_date),
        });
    }, [methods, props.budget]);

    return (
        <FormProvider {...methods}>
            <YStack gap="$4" p={'$2'}>
                <H4>Edit budget</H4>

                <Form onSubmit={onSubmit} gap={'$2'}>
                    <InputField
                        type="number"
                        label="Amount"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'amount', rules: { required: true } }}
                    />
                    <SelectField
                        label="Category"
                        options={categoriesOptions}
                        controller={{
                            name: 'category_id',
                        }}
                    />
                    <TextAreaField label="Description" controller={{ name: 'description' }} />
                    <Form.Trigger asChild disabled={!methods.formState.isValid}>
                        <Button>Save changes</Button>
                    </Form.Trigger>
                </Form>
            </YStack>
        </FormProvider>
    );
};

export const useEditBudgetSheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<BudgetDto | null>(null);

    const open = (budget: BudgetDto) => {
        setBudgetToEdit(budget);
        setIsOpen(true);
    };
    const close = () => setIsOpen(false);

    return {
        isOpen,
        setIsOpen,
        close,
        open,
        budgetToEdit,
    };
};

export const useDeleteBudgetConfirmation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<BudgetDto | null>(null);

    const open = (budget: BudgetDto) => {
        setBudgetToDelete(budget);
        setIsOpen(true);
    };
    const close = () => setIsOpen(false);

    return {
        isOpen,
        setIsOpen,
        close,
        open,
        budgetToDelete,
    };
};

type DeleteBudgetProps = Omit<DeleteConfirmationProps, 'title' | 'onDelete'> & {
    budget: BudgetDto | null;
};

export const DeleteBudget = (props: DeleteBudgetProps) => {
    const deleteBudget = useDeleteBudget();

    const onDelete = () => {
        if (!props.budget) {
            return;
        }
        deleteBudget.mutate(props.budget.id);
        props.onOpenChange?.(false);
    };
    return (
        <DeleteConfirmation
            open={props.open}
            onOpenChange={props.onOpenChange}
            onDelete={onDelete}
            title={`Are you sure you want to delete ${props.budget?.category?.name} budget?`}
        />
    );
};

export default function Tab() {
    const createBudgetSheet = useCreateBudgetSheet();
    const editBudgetSheet = useEditBudgetSheet();
    const deleteBudgetConfirmation = useDeleteBudgetConfirmation();
    const budgetList = useGetBudgetList();

    return (
        <YStack gap="$4" p="$2" flex={1}>
            <XGroup rounded={'$radius.12'} bordered>
                <XGroup.Item>
                    <Button icon={<ChevronLeft />} scaleIcon={1.5} />
                </XGroup.Item>
                <XGroup.Item>
                    <XStack flex={1} justify={'center'} items={'center'} gap={'$2'}>
                        <Text>{DEFAULT_FILTERS.start_date.toLocaleString()}</Text>
                        <Minus color={'$color08'} />
                        <Text>{DEFAULT_FILTERS.end_date.toLocaleString()}</Text>
                    </XStack>
                </XGroup.Item>
                <XGroup.Item>
                    <Button icon={<ChevronRight />} scaleIcon={1.5} />
                </XGroup.Item>
            </XGroup>
            <ScrollView flex={1}>
                <YGroup rounded={'$radius.4'} bordered>
                    {budgetList.data?.map((budget, index) => (
                        <YGroup.Item key={budget.id}>
                            {index ? <Separator /> : null}
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={budget.category?.name}
                                onPress={() => editBudgetSheet.open(budget)}
                                subTitle={
                                    <XStack gap="$2">
                                        <Text color={'$green10'}>20</Text>
                                        <Text color={'$color08'}>of {budget.amount}</Text>
                                    </XStack>
                                }
                                icon={
                                    <XStack>
                                        {icons
                                            .find((icon) => icon.name === budget.category?.icon)
                                            ?.icon(budget.category?.icon_color)}
                                    </XStack>
                                }
                                iconAfter={
                                    <XStack gap="$4">
                                        <Trash
                                            onPress={() => deleteBudgetConfirmation.open(budget)}
                                        />
                                    </XStack>
                                }
                            />
                        </YGroup.Item>
                    ))}
                </YGroup>
            </ScrollView>
            <Button onPress={createBudgetSheet.open} icon={Plus}>
                Add
            </Button>

            <Sheet open={createBudgetSheet.isOpen} onOpenChange={createBudgetSheet.setIsOpen}>
                <CreateBudgetForm
                    autoFocus={createBudgetSheet.isOpen}
                    onSubmit={createBudgetSheet.close}
                />
            </Sheet>

            <Sheet open={editBudgetSheet.isOpen} onOpenChange={editBudgetSheet.setIsOpen}>
                {editBudgetSheet.budgetToEdit && (
                    <EditBudgetForm
                        autoFocus={editBudgetSheet.isOpen}
                        onSubmit={editBudgetSheet.close}
                        budget={editBudgetSheet.budgetToEdit}
                    />
                )}
            </Sheet>

            <DeleteBudget
                open={deleteBudgetConfirmation.isOpen}
                onOpenChange={deleteBudgetConfirmation.setIsOpen}
                budget={deleteBudgetConfirmation.budgetToDelete}
            />
        </YStack>
    );
}
