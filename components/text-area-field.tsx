import { FieldValues, useFormContext, ControllerProps, Controller } from 'react-hook-form';
import { TextAreaProps, YStack, TextArea } from 'tamagui';
import { Label } from '@/components/label';

export type TextAreaFieldProps<T extends FieldValues> = TextAreaProps & {
    label?: string;
    controller?: Omit<ControllerProps<T>, 'render'>;
};

export const TextAreaField = <T extends FieldValues>({
    label,
    controller,
    ...props
}: TextAreaFieldProps<T>) => {
    const { control } = useFormContext<T>();

    return (
        <YStack>
            {label && <Label htmlFor={controller.name}>{label}</Label>}
            <Controller
                control={control}
                {...controller}
                render={({ field: { onChange, value } }) => (
                    <TextArea
                        id={controller.name}
                        onChangeText={onChange}
                        value={value}
                        {...props}
                    />
                )}
            />
        </YStack>
    );
};
