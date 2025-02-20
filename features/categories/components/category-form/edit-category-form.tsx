import { ColorPicker } from '@/components/color-picker';
import { IconPicker } from '@/components/icon-picker';
import { InputField } from '@/components/input-field';
import { RadioGroup } from '@/components/radio-group';
import { Button } from '@/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Form, Paragraph, Spinner, YStack } from 'tamagui';
import { useUpdateCategory } from '@/features/categories/api/query';
import { CategoryFormSchema } from './schema';
import { EditCategoryFormProps, CategoryFormType } from './types';
import { useEffect } from 'react';

export const EditCategoryForm = (props: EditCategoryFormProps) => {
    const updateCategory = useUpdateCategory({
        onMutate: () => {
            methods.reset();
            props.onSubmit();
        },
    });
    const methods = useForm<CategoryFormType>({
        defaultValues: {
            name: props.category.name,
            icon: props.category.icon,
            icon_color: props.category.icon_color,
            type: props.category.type,
        },
        resolver: zodResolver(CategoryFormSchema),
    });
    const currentColor = methods.watch('icon_color');

    const onSubmit = methods.handleSubmit((data: CategoryFormType) => {
        const shouldUpdateChildren =
            props.category.icon !== methods.getValues('icon') ||
            props.category.icon_color !== methods.getValues('icon_color') ||
            props.category.type !== methods.getValues('type');

        updateCategory.mutate({
            ...data,
            parent_id: props.category.parent_id,
            id: props.category.id,
            options: {
                updateChildren: shouldUpdateChildren,
            },
        });
    });

    useEffect(() => {
        methods.reset(props.category);
    }, [methods, props.category]);

    if (!props.autoFocus) {
        return null;
    }

    // TODO: might also be useful to share whole render below with CreateCategoryForm
    return (
        <YStack gap="$2" p="$4">
            <Paragraph>Edit {props.category.name}</Paragraph>

            <FormProvider {...methods}>
                <Form flex={1} gap="$2" onSubmit={onSubmit}>
                    <InputField
                        label="Name"
                        placeholder="Name"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'name', rules: { required: true } }}
                    />
                    {!props.isSubcategory && (
                        <>
                            <IconPicker
                                color={currentColor}
                                label="Icon"
                                controller={{ name: 'icon', rules: { required: true } }}
                            />
                            <ColorPicker label="Icon color" controller={{ name: 'icon_color' }} />
                            <RadioGroup
                                options={[
                                    { label: 'Expense', value: 'expense' },
                                    { label: 'Income', value: 'income' },
                                ]}
                                controller={{ name: 'type' }}
                            />
                        </>
                    )}
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
