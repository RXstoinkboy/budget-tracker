import { FieldValues, useFormContext, ControllerProps, Controller } from 'react-hook-form';
import { SelectProps, useMedia, Select, Adapt, Sheet, YStack } from 'tamagui';
import { Label } from '@/components/label';

// TODO: do the same with extending tamagui props for other components
export type SelectOption = FieldValues & {
    name: string;
    value: string;
};

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
                    value={value}
                    onValueChange={onChange}
                    disablePreventBodyScroll
                    id={controller.name}
                    {...props}>
                    <Select.Trigger>
                        <Select.Value placeholder={placeholder} />
                    </Select.Trigger>
                    <Adapt when={media.sm} platform="touch">
                        <Sheet modal dismissOnSnapToBottom native animation="medium">
                            {/* TODO: make it so it doesn't cover whole screen (?) */}
                            {/* TODO:  pass ....props somewhere*/}
                            {/* TODO: check if it works correctly with react hook form */}
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
                                <Select.Item index={index} key={option.value} value={option.value}>
                                    <Select.ItemText>{option.name}</Select.ItemText>
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
