import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ControllerProps, Controller, useFormContext, FieldValues } from 'react-hook-form';
import { Pressable } from 'react-native';
import { InputProps, Input, YStack } from 'tamagui';
import { Label } from '@/components/label';

export type DatePickerProps<T extends FieldValues> = InputProps & {
    label?: string;
    controller?: Omit<ControllerProps<T>, 'render'>;
};

export const DatePicker = <T extends FieldValues>({
    label,
    controller,
    ...props
}: DatePickerProps<T>) => {
    const { control, ...methods } = useFormContext<T>();

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: (event, date) => {
                methods.setValue(controller.name, date as any);
            },
        });
    };
    return (
        <YStack>
            {label && <Label htmlFor={controller.name}>{label}</Label>}
            <Controller
                control={control}
                {...controller}
                render={({ field: { value } }) => (
                    <Pressable onPress={showDatePicker}>
                        <Input
                            value={(value as Date).toLocaleDateString()}
                            showSoftInputOnFocus={false}
                            caretHidden
                            editable={false}
                            id={controller.name}
                            {...props}
                        />
                    </Pressable>
                )}
            />
        </YStack>
    );
};
