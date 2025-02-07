import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ControllerProps, Controller, useFormContext, FieldValues } from 'react-hook-form';
import { Pressable } from 'react-native';
import { InputProps, Input, Label, YStack } from 'tamagui';

export type DatePickerProps<T extends FieldValues> = Omit<ControllerProps<T>, 'render'> &
    InputProps & {
        label?: string;
        name: string;
    };

export const DatePicker = <T extends FieldValues>({
    label,
    name,
    ...props
}: DatePickerProps<T>) => {
    const { control, ...methods } = useFormContext<T>();

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: (event, date) => {
                methods.setValue(name, date as any);
            },
        });
    };
    return (
        <YStack>
            {label && <Label htmlFor={name}>{label}</Label>}
            <Controller
                control={control}
                name={name}
                render={({ field: { value } }) => (
                    <Pressable onPress={showDatePicker}>
                        <Input
                            value={(value as Date).toLocaleDateString()}
                            showSoftInputOnFocus={false}
                            caretHidden
                            editable={false}
                            id={name}
                            {...props}
                        />
                    </Pressable>
                )}
            />
        </YStack>
    );
};
