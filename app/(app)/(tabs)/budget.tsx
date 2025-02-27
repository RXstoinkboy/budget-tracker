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
import { Minus, ChevronLeft, ChevronRight, Plus, Trash, ListPlus } from '@tamagui/lucide-icons';
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
    useTheme,
    Card,
    Paragraph,
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

const useBalanceColors = () => {
    const theme = useTheme();

    const colors = {
        exceeded: theme.red10,
        below: theme.green10,
        exact: theme.accent10,
    };

    const getColor = (spent: number, planned: number) => {
        if (spent > planned) {
            return colors.exceeded;
        }
        if (spent < planned) {
            return colors.below;
        }
        return colors.exact;
    };

    return {
        ...colors,
        getColor,
    };
};

export default function Tab() {
    const createBudgetSheet = useCreateBudgetSheet();
    const editBudgetSheet = useEditBudgetSheet();
    const deleteBudgetConfirmation = useDeleteBudgetConfirmation();
    const budgetList = useGetBudgetList();
    const { getColor } = useBalanceColors();

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
                <YStack p="$2" gap={'$2'}>
                    <XStack flex={1} justify="space-between">
                        <Paragraph>Planned expenses:</Paragraph>
                        <Paragraph>{budgetList.data?.total.planned}</Paragraph>
                    </XStack>
                    <XStack flex={1} justify="space-between">
                        <Paragraph>Spent in planned:</Paragraph>
                        <Paragraph
                            color={getColor(
                                budgetList.data?.total.spentInPlanned ?? 0,
                                budgetList.data?.total.planned ?? 0,
                            )}>
                            {budgetList.data?.total.spentInPlanned}
                        </Paragraph>
                    </XStack>
                    <XStack flex={1} justify="space-between">
                        <Paragraph>Total spent:</Paragraph>
                        <Paragraph>{budgetList.data?.total.spentAll}</Paragraph>
                    </XStack>
                </YStack>
                <YGroup rounded={'$radius.4'} bordered>
                    {budgetList.data?.budgets.map((budget, index) => {
                        const color = getColor(budget.spent, budget.amount);

                        return (
                            <YGroup.Item key={budget.id}>
                                {index ? <Separator /> : null}
                                <ListItem
                                    hoverTheme
                                    pressTheme
                                    title={budget.category?.name}
                                    onPress={() => editBudgetSheet.open(budget)}
                                    subTitle={
                                        <XStack gap="$2">
                                            <Text color={color}>{budget.spent}</Text>
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
                                                onPress={() =>
                                                    deleteBudgetConfirmation.open(budget)
                                                }
                                            />
                                        </XStack>
                                    }
                                />
                            </YGroup.Item>
                        );
                    })}
                </YGroup>
                {budgetList.data?.notPlanned.totalSpent && (
                    <Card rounded={'$radius.4'} bordered mt={'$4'}>
                        <YStack>
                            <XStack p={'$4'} flex={1} justify={'space-between'} items="center">
                                <XStack flex={1} items="center">
                                    <Paragraph>Not planned:</Paragraph>
                                    <Button mx={'$4'} size={'$3'} variant="outlined" icon={Plus}>
                                        Add all
                                    </Button>
                                </XStack>
                                <Paragraph>{budgetList.data?.notPlanned.totalSpent}</Paragraph>
                            </XStack>
                            <Separator />
                            <YGroup>
                                {budgetList.data?.notPlanned.categories.map((category) => (
                                    <YGroup.Item key={category.category_id}>
                                        {/* TODO: have to open prefilled form for creating new budget entry */}
                                        <ListItem
                                            hoverTheme
                                            title={category.category_id}
                                            subTitle={
                                                <Text color={'$color08'}>{category.spent}</Text>
                                            }
                                            icon={
                                                <XStack>
                                                    <ListPlus />
                                                </XStack>
                                            }
                                            iconAfter={
                                                <XStack>
                                                    <ListPlus />
                                                </XStack>
                                            }
                                        />
                                    </YGroup.Item>
                                ))}
                            </YGroup>
                        </YStack>
                    </Card>
                )}
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
