import { ColorPicker } from '@/components/color-picker';
import { IconPicker } from '@/components/icon-picker';
import { InputField } from '@/components/input-field';
import { RadioGroup } from '@/components/radio-group';
import { Button } from '@/components/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Form, Paragraph, Spinner, YStack } from 'tamagui';
import { useCreateCategory } from '../../api/query';
import { CategoryFormSchema } from './schema';
import { CategoryFormProps, CategoryFormType } from './types';

export const CreateCategoryForm = (props: CategoryFormProps) => {
    const createCategory = useCreateCategory({
        onMutate: () => {
            props.onSubmit();
            methods.reset();
        },
    });
    const methods = useForm<CategoryFormType>({
        defaultValues: {
            name: '',
            icon: 'help',
            icon_color: '#a63535',
            type: 'expense',
        },
        resolver: zodResolver(CategoryFormSchema),
    });
    const currentColor = methods.watch('icon_color');

    const onSubmit = methods.handleSubmit((data: CategoryFormType) => {
        createCategory.mutate({
            ...data,
            parent_id: null,
        });
    });

    if (!props.autoFocus) {
        return null;
    }

    return (
        <YStack gap="$2" p="$4">
            <Paragraph>Create new category</Paragraph>

            <FormProvider {...methods}>
                <Form flex={1} gap="$2" onSubmit={onSubmit}>
                    <InputField
                        label="Name"
                        placeholder="Name"
                        autoFocus={props.autoFocus}
                        controller={{ name: 'name', rules: { required: true } }}
                    />
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
