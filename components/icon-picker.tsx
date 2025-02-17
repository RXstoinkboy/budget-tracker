import { Carrot, House, ShoppingCart, Car, PiggyBank, CircleHelp } from '@tamagui/lucide-icons';
import { useFormContext, FieldValues, ControllerProps, Controller } from 'react-hook-form';
import { Pressable } from 'react-native';
import { View, YStack, XStack } from 'tamagui';
import { Label } from '@/components/label';

const icons = [
    {
        name: 'carrot',
        icon: (color: any) => <Carrot color={color} />,
    },
    {
        name: 'house',
        icon: (color: any) => <House color={color} />,
    },
    {
        name: 'shopping-cart',
        icon: (color: any) => <ShoppingCart color={color} />,
    },
    {
        name: 'car',
        icon: (color: any) => <Car color={color} />,
    },
    {
        name: 'piggy-bank',
        icon: (color: any) => <PiggyBank color={color} />,
    },
    {
        name: 'help',
        icon: (color: any) => <CircleHelp color={color} />,
    },
];

type IconPickerProps<T extends FieldValues> = {
    label?: string;
    color?: string;
    controller: Omit<ControllerProps<T>, 'render'>;
};

export const IconPicker = <T extends FieldValues>({
    controller,
    color,
    label,
    ...props
}: IconPickerProps<T>) => {
    const { control } = useFormContext<T>();
    return (
        <YStack>
            {label && <Label htmlFor={controller.name}>{label}</Label>}
            <Controller
                control={control}
                {...controller}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <XStack>
                        {icons.map((icon) => (
                            <Pressable onPress={() => onChange(icon.name)} key={icon.name}>
                                <View
                                    bg={value === icon.name ? '$color06' : undefined}
                                    rounded={'$3'}
                                    p="$2">
                                    {icon.icon(color)}
                                </View>
                            </Pressable>
                        ))}
                    </XStack>
                )}
            />
        </YStack>
    );
};
