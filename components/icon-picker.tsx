import { useFormContext, FieldValues, ControllerProps, Controller } from 'react-hook-form';
import { Pressable } from 'react-native';
import { View, YStack, XStack } from 'tamagui';
import { Label } from '@/components/label';
import { icons } from '@/consts/icons';

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
