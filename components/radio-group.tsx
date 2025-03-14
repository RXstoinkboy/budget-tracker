import { FieldValues, Controller, useFormContext, ControllerProps } from 'react-hook-form';
import {
    XStack,
    RadioGroup as TamaguiRadioGroup,
    RadioGroupProps as TamaguiRadioGroupProps,
    Label,
    YStack,
} from 'tamagui';

export type RadioGroupOption = {
    label: string;
    value: string;
};

export const RadioGroupItemWithLabel = ({ value, label }: RadioGroupOption) => {
    return (
        <XStack items="center" gap="$2">
            <TamaguiRadioGroup.Item value={value} id={label}>
                <TamaguiRadioGroup.Indicator />
            </TamaguiRadioGroup.Item>

            <Label htmlFor={label}>{label}</Label>
        </XStack>
    );
};

type RadioGroupProps<T extends FieldValues> = TamaguiRadioGroupProps & {
    label?: string;
    options: RadioGroupOption[];
    controller: Omit<ControllerProps<T>, 'render'>;
};

export const RadioGroup = <T extends FieldValues>({
    controller,
    label,
    options,
    onValueChange,
    ...props
}: RadioGroupProps<T>) => {
    const { control } = useFormContext<T>();

    return (
        <YStack>
            {label && <Label htmlFor={controller.name}>{label}</Label>}
            <Controller
                control={control}
                {...controller}
                render={({ field: { value, onChange } }) => {
                    return (
                        <TamaguiRadioGroup
                            value={value}
                            onValueChange={(val) => {
                                onChange(val);
                                onValueChange?.(val);
                            }}
                            {...props}>
                            <XStack gap="$6">
                                {options.map((option) => (
                                    <RadioGroupItemWithLabel
                                        key={option.value}
                                        value={option.value}
                                        label={option.label}
                                    />
                                ))}
                            </XStack>
                        </TamaguiRadioGroup>
                    );
                }}
            />
        </YStack>
    );
};
