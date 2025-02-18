import { InputField } from '@/components/input-field';
import { Button } from '@/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Form, Paragraph, Spinner, YStack } from 'tamagui';
import { useCreateCategory } from '../../api/query';
import { CategoryFormSchema } from './schema';
import { SubcategoryFormProps, CategoryFormType } from './types';

export const CreateSubcategoryForm = (props: SubcategoryFormProps) => {
    const createCategory = useCreateCategory({
        onMutate: () => {
            props.onSubmit();
            methods.reset();
        },
    });
    const methods = useForm<CategoryFormType>({
        defaultValues: {
            name: '',
            icon: props.parentCategory?.icon,
            icon_color: props.parentCategory?.icon_color,
            type: props.parentCategory?.type,
        },
        resolver: zodResolver(CategoryFormSchema),
    });

    const onSubmit = methods.handleSubmit((data: CategoryFormType) => {
        createCategory.mutate({
            ...data,
            parent_id: props.parentCategory?.id ? props.parentCategory?.id : null,
        });
    });

    if (!props.autoFocus) {
        return null;
    }

    return (
        <YStack gap="$2" p="$4">
            <Paragraph>Create new subcategory for {props.parentCategory?.name}</Paragraph>

            <FormProvider {...methods}>
                <Form flex={1} gap="$2" onSubmit={onSubmit}>
                    <InputField
                        label="Name"
                        placeholder="Name"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'name', rules: { required: true } }}
                    />
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
