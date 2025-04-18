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
import { BudgetDto, CreateBudgetDto } from '@/features/budget/api/types';
import { useAvailableBudgetCategories } from '@/features/budget/hooks/use-available-budget-categories';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Minus,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash,
    ListPlus,
    X,
    Pencil,
} from '@tamagui/lucide-icons';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
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
    category_id: z.string().nullable(),
    amount: z.string().regex(/^[0-9]+$/),
});

type BudgetFormType = z.infer<typeof BudgetFormSchema>;

type CreateBudgetFormProps = {
    autoFocus?: boolean;
    onSubmit: () => void;
    budget?: Partial<CreateBudgetDto>;
};

export const CreateBudgetForm = (props: CreateBudgetFormProps) => {
    const createBudget = useCreateBudget({
        onMutate: () => {
            props.onSubmit();
        },
    });
    const { options, defaultValue } = useAvailableBudgetCategories();
    const startOfMonth = DateTime.now().startOf('month');
    const endOfMonth = DateTime.now().endOf('month');
    const isAddUncategorized = props.budget?.category_id === null;

    const methods = useForm<BudgetFormType>({
        defaultValues: {
            description: '',
            category_id: isAddUncategorized ? null : (props.budget?.category_id ?? defaultValue),
            // TODO: there is no period selection at the moment so I am using current month
            start_date: startOfMonth,
            end_date: endOfMonth,
            amount: props.budget?.amount?.toString() ?? '',
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
                    {isAddUncategorized ? null : (
                        <SelectField
                            label="Category"
                            options={options}
                            controller={{
                                name: 'category_id',
                            }}
                        />
                    )}
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
    const [budgetToCreateTemplate, setBudgetToCreateTemplate] =
        useState<Partial<CreateBudgetDto> | null>(null);

    const open = (budgetToCreate: Partial<CreateBudgetDto> | null = null) => {
        setBudgetToCreateTemplate(budgetToCreate);
        setIsOpen(true);
    };
    const close = () => setIsOpen(false);

    return {
        isOpen,
        setIsOpen,
        close,
        open,
        budgetToCreateTemplate,
    };
};

type EditBudgetFormProps = {
    autoFocus?: boolean;
    onSubmit: () => void;
    budget: BudgetDto;
    categorySelectHidden: boolean;
};

const mapBudgetToForm = (budget: BudgetDto) => ({
    ...budget,
    amount: String(budget.amount),
    start_date: DateTime.fromISO(budget.start_date),
    end_date: DateTime.fromISO(budget.end_date),
});

export const EditBudgetForm = (props: EditBudgetFormProps) => {
    const editBudget = useEditBudget({
        onMutate: () => {
            props.onSubmit();
        },
    });
    const { options } = useAvailableBudgetCategories(props.budget);
    const startOfMonth = DateTime.now().startOf('month');
    const endOfMonth = DateTime.now().endOf('month');

    const methods = useForm<BudgetFormType>({
        defaultValues: mapBudgetToForm(props.budget),
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
        methods.reset(mapBudgetToForm(props.budget));
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
                    {props.categorySelectHidden ? null : (
                        <SelectField
                            label="Category"
                            options={options}
                            controller={{
                                name: 'category_id',
                            }}
                        />
                    )}
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
    const [categorySelectHidden, setCategorySelectHidden] = useState(false);

    const open = (budget: BudgetDto, hideCategorySelect = false) => {
        setBudgetToEdit(budget);
        setIsOpen(true);
        setCategorySelectHidden(hideCategorySelect);
    };
    const close = () => setIsOpen(false);

    return {
        isOpen,
        setIsOpen,
        close,
        open,
        budgetToEdit,
        categorySelectHidden,
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
            title={`Are you sure you want to delete ${
                props.budget?.category?.name
                    ? `${props.budget?.category?.name} budget`
                    : 'plan for rest of expenses'
            } ?`}
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
                    <XStack flex={1} justify="space-between" items="center" gap={'$4'}>
                        <Paragraph>Planned expenses:</Paragraph>
                        <Separator borderColor={'$color3'} borderStyle="dashed" />

                        <Paragraph>{budgetList.data?.total.planned}</Paragraph>
                    </XStack>
                    <XStack flex={1} justify="space-between" items="center" gap={'$4'}>
                        <Paragraph>Spent in planned:</Paragraph>
                        <Separator borderColor={'$color3'} borderStyle="dashed" />
                        <Paragraph>{budgetList.data?.total.spentInPlanned}</Paragraph>
                    </XStack>
                    <XStack flex={1} justify="space-between" items="center" gap={'$4'}>
                        <Paragraph>Total spent:</Paragraph>
                        <Separator borderColor={'$color3'} borderStyle="dashed" />
                        <Paragraph
                            color={getColor(
                                budgetList.data?.total.spentAll ?? 0,
                                budgetList.data?.total.planned ?? 0,
                            )}>
                            {budgetList.data?.total.spentAll}
                        </Paragraph>
                    </XStack>
                    <Separator />
                </YStack>
                <YStack mt={'$4'}>
                    <Text px={'$2'}>Budget plan:</Text>
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
                                                    .find(
                                                        (icon) =>
                                                            icon.name === budget.category?.icon,
                                                    )
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
                </YStack>

                {budgetList.data?.uncategorized.totalSpent ? (
                    <Card rounded={'$radius.4'} bordered mt={'$4'}>
                        <YStack>
                            <YStack p={'$4'} gap={'$2'}>
                                <XStack flex={1} justify={'space-between'} items="center">
                                    <Paragraph>Rest of expenses:</Paragraph>
                                    <XStack>
                                        <Paragraph
                                            color={getColor(
                                                budgetList.data?.uncategorized.totalSpent,
                                                budgetList.data?.uncategorized.planned,
                                            )}>
                                            {budgetList.data?.uncategorized.totalSpent}
                                        </Paragraph>
                                        {budgetList.data?.uncategorized.planned ? (
                                            <Paragraph>
                                                {' '}
                                                of {budgetList.data?.uncategorized.planned} planned
                                            </Paragraph>
                                        ) : null}
                                    </XStack>
                                </XStack>
                                <XStack flex={1}>
                                    {!budgetList.data.uncategorized.planned ? (
                                        <Button
                                            mx={'$4'}
                                            size={'$3'}
                                            flex={1}
                                            height={'$2'}
                                            icon={Plus}
                                            onPress={() =>
                                                createBudgetSheet.open({
                                                    category_id: null,
                                                    amount: budgetList.data?.uncategorized
                                                        .totalSpent,
                                                })
                                            }>
                                            Plan rest
                                        </Button>
                                    ) : (
                                        <XStack flex={1} gap={'$2'}>
                                            <Button
                                                size={'$3'}
                                                flex={1}
                                                height={'$2'}
                                                icon={X}
                                                onPress={() => {
                                                    const budget =
                                                        budgetList.data?.uncategorized.budget;
                                                    if (budget) {
                                                        deleteBudgetConfirmation.open(budget);
                                                    }
                                                }}>
                                                Clear
                                            </Button>
                                            <Button
                                                size={'$3'}
                                                flex={1}
                                                height={'$2'}
                                                icon={Pencil}
                                                onPress={() => {
                                                    const budget =
                                                        budgetList.data?.uncategorized.budget;
                                                    if (budget) {
                                                        editBudgetSheet.open(budget, true);
                                                    }
                                                }}>
                                                Edit
                                            </Button>
                                        </XStack>
                                    )}
                                </XStack>
                            </YStack>
                            <Separator />
                            <YGroup>
                                {budgetList.data?.uncategorized.categories.map((category) => (
                                    <YGroup.Item key={category.category_id}>
                                        <ListItem
                                            hoverTheme
                                            title={category.name}
                                            subTitle={
                                                <Text color={'$color08'}>{category.spent}</Text>
                                            }
                                            icon={
                                                <XStack>
                                                    {icons
                                                        .find((icon) => icon.name === category.icon)
                                                        ?.icon(category.icon_color)}
                                                </XStack>
                                            }
                                            iconAfter={
                                                <XStack>
                                                    <Pressable
                                                        onPress={() =>
                                                            createBudgetSheet.open({
                                                                category_id: category.category_id,
                                                                amount: category.spent,
                                                            })
                                                        }>
                                                        <ListPlus />
                                                    </Pressable>
                                                </XStack>
                                            }
                                        />
                                    </YGroup.Item>
                                ))}
                            </YGroup>
                        </YStack>
                    </Card>
                ) : null}
            </ScrollView>
            <Button onPress={() => createBudgetSheet.open()} icon={Plus}>
                Add
            </Button>

            <Sheet open={createBudgetSheet.isOpen} onOpenChange={createBudgetSheet.setIsOpen}>
                <CreateBudgetForm
                    autoFocus={createBudgetSheet.isOpen}
                    onSubmit={createBudgetSheet.close}
                    budget={createBudgetSheet.budgetToCreateTemplate ?? undefined}
                />
            </Sheet>

            <Sheet open={editBudgetSheet.isOpen} onOpenChange={editBudgetSheet.setIsOpen}>
                {editBudgetSheet.budgetToEdit ? (
                    <EditBudgetForm
                        autoFocus={editBudgetSheet.isOpen}
                        onSubmit={editBudgetSheet.close}
                        budget={editBudgetSheet.budgetToEdit}
                        categorySelectHidden={editBudgetSheet.categorySelectHidden}
                    />
                ) : null}
            </Sheet>

            <DeleteBudget
                open={deleteBudgetConfirmation.isOpen}
                onOpenChange={deleteBudgetConfirmation.setIsOpen}
                budget={deleteBudgetConfirmation.budgetToDelete}
            />
        </YStack>
    );
}
