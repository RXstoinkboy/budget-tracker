import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Text, Form, ListItem, Paragraph, ScrollView, Spinner, YStack } from 'tamagui';
import { useGetCategories, useUpdateCategory } from '@/features/categories/api/query';
import { MoveCategoryFormSchema } from './schema';
import { EditCategoryFormProps, MoveCategoryFormType } from './types';
import { useEffect } from 'react';
import { Button } from '@/components/button';

export const MoveCategoryForm = (props: EditCategoryFormProps) => {
    const categories = useGetCategories();
    const updateCategory = useUpdateCategory({
        onMutate: () => {
            props.onSubmit();
            methods.reset();
        },
    });
    const methods = useForm<MoveCategoryFormType>({
        defaultValues: {
            parent_id: props.category.parent_id ?? undefined,
        },
        resolver: zodResolver(MoveCategoryFormSchema),
    });
    const categoriesOptions = (categories.data?.selectOptions.all ?? []).filter((cat) => {
        return cat.value !== props.category.parent_id && cat.meta?.isParent;
    });

    const onSubmit = methods.handleSubmit((data: MoveCategoryFormType) => {
        const parentId = methods.getValues('parent_id');
        const newParent = categories.data?.list.find((cat) => cat.id === parentId);

        updateCategory.mutate({
            ...data,
            id: props.category.id,
            name: props.category.name,
            icon: newParent?.icon ?? props.category.icon,
            icon_color: newParent?.icon_color ?? props.category.icon_color,
            type: newParent?.type ?? props.category.type,
        });
    });

    useEffect(() => {
        methods.reset({
            parent_id: props.category.parent_id ?? undefined,
        });
    }, [methods, props.category]);

    if (!props.autoFocus) {
        return null;
    }

    // TODO: might also be useful to share whole render below with CreateCategoryForm
    return (
        <YStack gap="$2" p="$4">
            <Paragraph>Move {props.category.name} to new parent</Paragraph>

            <FormProvider {...methods}>
                <Form flex={1} gap="$2" onSubmit={onSubmit}>
                    <Controller
                        control={methods.control}
                        name="parent_id"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            // TODO: this needs to be fixed. Such list at least for now looks ugly
                            <ScrollView maxH={300}>
                                {categoriesOptions.map((option) => {
                                    return (
                                        <ListItem
                                            key={option.value}
                                            hoverStyle={{
                                                bg: '$backgroundHover',
                                                cursor: 'pointer',
                                            }}
                                            onPress={() => {
                                                onChange(option.value);
                                            }}>
                                            <Text
                                                color={
                                                    option.value === value ? '$color10' : '$color12'
                                                }>
                                                {option.name}
                                            </Text>
                                        </ListItem>
                                    );
                                })}
                            </ScrollView>
                        )}
                    />

                    <Form.Trigger asChild disabled={!methods.formState.isValid}>
                        <Button icon={updateCategory.isPending ? <Spinner /> : undefined}>
                            Save
                        </Button>
                    </Form.Trigger>
                </Form>
            </FormProvider>
        </YStack>
    );
};
