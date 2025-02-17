import { ColorPicker } from '@/components/color-picker';
import { IconPicker } from '@/components/icon-picker';
import { InputField } from '@/components/input-field';
import { RadioGroup } from '@/components/radio-group';
import { Button } from '@/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Form, Paragraph, Spinner, YStack } from 'tamagui';
import { z } from 'zod';
import { useCreateCategory } from '../api/query';
import { CategoryDto } from '../api/types';

const CategoryFormSchema = z.object({
    name: z.string().min(1),
    icon: z.string(),
    icon_color: z.string(),
    type: z.string(),
});

type CategoryFormType = z.infer<typeof CategoryFormSchema>;

type CreateCategoryFormProps = {
    onSubmit: () => void;
    autoFocus?: boolean;
    parentCategory?: CategoryDto | null;
};

export const CreateCategoryForm = (props: CreateCategoryFormProps) => {
    const createCategory = useCreateCategory({
        onMutate: () => {
            props.onSubmit();
            methods.reset();
        },
    });
    const methods = useForm<CategoryFormType>({
        defaultValues: {
            name: '',
            icon: props.parentCategory ? props.parentCategory.icon : 'help',
            icon_color: props.parentCategory ? props.parentCategory.icon_color : '#a63535',
            type: props.parentCategory ? props.parentCategory.type : 'expense',
        },
        resolver: zodResolver(CategoryFormSchema),
    });
    const currentColor = methods.watch('icon_color');

    const onSubmit = methods.handleSubmit((data: CategoryFormType) => {
        createCategory.mutate({
            ...data,
            parent_id: props.parentCategory ? props.parentCategory.id : null,
        });
    });

    if (!props.autoFocus) {
        return null;
    }

    return (
        <YStack gap="$2" p="$4">
            {props.parentCategory ? (
                <Paragraph>Create new subcategory for {props.parentCategory.name}</Paragraph>
            ) : (
                <Paragraph>Create new category</Paragraph>
            )}

            <FormProvider {...methods}>
                <Form flex={1} gap="$2" onSubmit={onSubmit}>
                    <InputField
                        label="Name"
                        placeholder="Name"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'name', rules: { required: true } }}
                    />
                    {!props.parentCategory ? (
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
                    ) : null}
                    <Form.Trigger asChild disabled={!methods.formState.isValid}>
                        <Button icon={createCategory.isPending ? <Spinner /> : undefined}>
                            Create
                        </Button>
                    </Form.Trigger>
                </Form>
            </FormProvider>
        </YStack>
    );
};
