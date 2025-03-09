import { FieldValues, useFormContext, ControllerProps, Controller } from 'react-hook-form';
import { SelectProps, useMedia, Select, Adapt, Sheet, YStack, XStack } from 'tamagui';
import { Label } from '@/components/label';
import { ReactNode } from 'react';

// TODO: do the same with extending tamagui props for other components
export type SelectOption = FieldValues & {
    name: string;
    value: string | null;
    left?: ReactNode;
};

const EMPTY_VALUE_INTERNAL = 'EMPTY_VALUE_INTERNAL';
const nullToEmptyInternal = (value: string | null) =>
    value === null ? EMPTY_VALUE_INTERNAL : value;

type SelectItemProps<T extends FieldValues> = SelectProps & {
    options: SelectOption[];
    placeholder?: string;
    controller: Omit<ControllerProps<T>, 'render'>;
};

const SelectDropdown = <T extends FieldValues>({
    placeholder,
    options,
    controller,
    ...props
}: SelectItemProps<T>) => {
    const { control } = useFormContext<T>();
    const media = useMedia();

    return (
        <Controller
            control={control}
            {...controller}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Select
                    value={nullToEmptyInternal(value)}
                    onValueChange={(v) => onChange(v === EMPTY_VALUE_INTERNAL ? null : v)}
                    disablePreventBodyScroll
                    id={controller.name}
                    {...props}>
                    <Select.Trigger>
                        <Select.Value placeholder={placeholder} />
                    </Select.Trigger>
                    <Adapt when={media.sm} platform="touch">
                        <Sheet modal dismissOnSnapToBottom native animation="quick">
                            {/* TODO: make it so it doesn't cover whole screen (?) */}
                            {/* TODO:  pass ....props somewhere*/}
                            <Sheet.Frame>
                                <Sheet.ScrollView>
                                    <Adapt.Contents />
                                </Sheet.ScrollView>
                            </Sheet.Frame>
                            <Sheet.Overlay />
                        </Sheet>
                    </Adapt>
                    <Select.Content>
                        <Select.Viewport>
                            {options.map((option, index) => (
                                <Select.Item
                                    index={index}
                                    key={nullToEmptyInternal(option.value)}
                                    value={nullToEmptyInternal(option.value)}>
                                    <XStack gap="$2" items="center">
                                        {option.left}
                                        <Select.ItemText>{option.name}</Select.ItemText>
                                    </XStack>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select>
            )}
        />
    );
};

export type SelectFieldProps<T extends FieldValues> = SelectItemProps<T> & {
    label?: string;
};

export const SelectField = <T extends FieldValues>({
    label,
    name,
    ...props
}: SelectFieldProps<T>) => {
    return (
        <YStack>
            {label && <Label htmlFor={name}>{label}</Label>}
            <SelectDropdown id={name} name={name} {...props} />
        </YStack>
    );
};
