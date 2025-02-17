import { useFormContext, FieldValues, ControllerProps, Controller } from 'react-hook-form';
import { Pressable } from 'react-native';
import { View, YStack, Circle } from 'tamagui';
import { Label } from '@/components/label';

const colors = [
    '#a63535',
    '#1e7a1e',
    '#202085',
    '#7d7d19',
    '#fb00fb',
    '#2c7575',
    '#800000',
    '#008000',
    '#0101a5',
    '#e5e504',
    '#800080',
    '#008080',
    '#c0c0c0',
];

type ColorPickerProps<T extends FieldValues> = {
    label?: string;
    controller: Omit<ControllerProps<T>, 'render'>;
};

export const ColorPicker = <T extends FieldValues>({
    controller,
    ...props
}: ColorPickerProps<T>) => {
    const { control } = useFormContext<T>();
    return (
        <YStack>
            {props.label && <Label htmlFor={controller.name}>{props.label}</Label>}
            <Controller
                control={control}
                {...controller}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <View display="flex" flexDirection="row" flexWrap="wrap" gap="$2">
                        {colors.map((color) => (
                            <Pressable onPress={() => onChange(color)} key={color}>
                                <View
                                    bg={value === color ? '$color06' : undefined}
                                    rounded={'$3'}
                                    p="$2">
                                    {/* TODO: change this so these colors are maybe moved to tamagui theme */}
                                    <Circle size="$2" bg={color as any} />
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            />
        </YStack>
    );
};
