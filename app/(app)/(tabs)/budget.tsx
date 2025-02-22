import { Button } from '@/components/button';
import { InputField } from '@/components/input-field';
import { SelectField } from '@/components/select-field';
import { Sheet } from '@/components/sheet';
import { TextAreaField } from '@/components/text-area-field';
import { icons } from '@/consts/icons';
import { DEFAULT_FILTERS, useCreateBudget, useGetBudgetList } from '@/features/budget/api/query';
import { useGetCategories } from '@/features/categories/api/query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, ChevronLeft, ChevronRight, Plus, Trash } from '@tamagui/lucide-icons';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Text, ListItem, ScrollView, XStack, YStack, H4, Form, XGroup } from 'tamagui';
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
    onSubmit: () => void;
};

export const CreateBudgetForm = (props: CreateBudgetFormProps) => {
    const { data } = useGetCategories();
    const createBudget = useCreateBudget({
        onMutate: () => {
            props.onSubmit();
        },
    });
    const categoriesOptions = data?.selectOptions || [];
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

                {/* TODO: element to select a period (whole month) */}
                <Form onSubmit={onSubmit} gap={'$2'}>
                    <InputField
                        type="number"
                        label="Amount"
                        placeholder="Amount"
                        controller={{ name: 'amount', rules: { required: true } }}
                    />
                    <SelectField
                        label="Category"
                        options={categoriesOptions}
                        placeholder="Select category"
                        controller={{
                            name: 'category_id',
                        }}
                    />
                    <TextAreaField
                        label="description"
                        placeholder="Description"
                        controller={{ name: 'description' }}
                    />
                    <Form.Trigger asChild disabled={!methods.formState.isValid}>
                        <Button>Save</Button>
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

export default function Tab() {
    const createBudgetSheet = useCreateBudgetSheet();
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
                {budgetList.data?.map((budget) => (
                    <ListItem
                        key={budget.id}
                        hoverTheme
                        pressTheme
                        title={budget.category?.name}
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
                                <Trash />
                            </XStack>
                        }
                    />
                ))}
            </ScrollView>
            <Button onPress={createBudgetSheet.open} icon={Plus}>
                Add
            </Button>

            <Sheet open={createBudgetSheet.isOpen} onOpenChange={createBudgetSheet.setIsOpen}>
                <CreateBudgetForm
                    // autoFocus={editSubcategorySheet.isOpen}
                    onSubmit={createBudgetSheet.close}
                />
            </Sheet>
        </YStack>
    );
}
