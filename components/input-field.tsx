import { Controller, ControllerProps, FieldValues, useFormContext } from 'react-hook-form';
import { Text, InputProps, YStack, Input, XStack } from 'tamagui';
import { Label } from '@/components/label';

type InputFieldProps<T extends FieldValues> = InputProps & {
    type?: 'text' | 'password' | 'number';
    label?: string;
    controller: Omit<ControllerProps<T>, 'render'>;
};
export function InputField<T extends FieldValues>({
    controller,
    type,
    label,
    ...props
}: InputFieldProps<T>) {
    const { control } = useFormContext<T>();

    return (
        <YStack>
            <XStack items="center" gap="$1">
                {label && <Label htmlFor={controller.name}>{label}</Label>}
                {controller.rules?.required && <Text>*</Text>}
            </XStack>
            <Controller
                control={control}
                {...controller}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        id={controller.name}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={type === 'password'}
                        // TODO: I think it should be 'numeric' to work cross platform but for some reason input is laggy on 'numeric'
                        keyboardType={type === 'number' ? 'number-pad' : 'default'}
                        {...props}
                    />
                )}
                name={controller.name}
            />
            {/* TODO: maybe I will be able to do it as separate component */}
            {/* {errors.firstName && <Text>This is required.</Text>} */}
        </YStack>
    );
}
