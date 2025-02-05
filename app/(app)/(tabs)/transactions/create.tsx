import { ChevronDown, ChevronUp, Check } from '@tamagui/lucide-icons';
import React from 'react';
import { useState } from 'react';
import {
    Button,
    Form,
    Spinner,
    Text,
    YStack,
    RadioGroup,
    XStack,
    Label,
    SizeTokens,
    Input,
    TextArea,
    Select,
    SelectProps,
    FontSizeTokens,
    getFontSize,
} from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

export function RadioGroupItemWithLabel(props: { size: SizeTokens; value: string; label: string }) {
    const id = `radiogroup-${props.value}`;
    return (
        <XStack width={300} gap="$4">
            <RadioGroup.Item value={props.value} id={id} size={props.size}>
                <RadioGroup.Indicator />
            </RadioGroup.Item>

            <Label size={props.size} htmlFor={id}>
                {props.label}
            </Label>
        </XStack>
    );
}

// TODO: maybe change it to ToggleGroup
// TODO: add some default value and some useful props
export function IsExpenseController() {
    return (
        <RadioGroup aria-labelledby="Select one item" defaultValue="3" name="form">
            <XStack gap="$2">
                <RadioGroupItemWithLabel size="$3" value="2" label="Expense" />
                <RadioGroupItemWithLabel size="$4" value="3" label="Income" />
            </XStack>
        </RadioGroup>
    );
}

// TODO: defaultValue, type (numeric | date | text | password),
// TODO: onChange, value, disabled, required, min,
type InputFieldProps = {
    label?: string;
    id?: string;
    placeholder?: string;
};
export function InputField(props: InputFieldProps) {
    return (
        <YStack>
            {props.label && <Label htmlFor={props.id}>{props.label}</Label>}
            <Input id={props.id} flex={1} placeholder={props.placeholder} />
        </YStack>
    );
}

type TextAreaFieldProps = {
    label?: string;
    id?: string;
    placeholder?: string;
};
export function TextAreaField(props: TextAreaFieldProps) {
    return (
        <YStack>
            {props.label && <Label htmlFor={props.id}>{props.label}</Label>}
            <TextArea id={props.id} flex={1} placeholder={props.placeholder} />
        </YStack>
    );
}

// TODO: do the same with extending tamagui props for other components
type SelectItemValue = {
    name: string;
    value: string;
};
type SelectItemProps = SelectProps & { items: SelectItemValue[] };

const SelectItem = (props: SelectItemProps) => {
    // TODO: some default value
    const [val, setVal] = useState<string | undefined>();

    return (
        <Select value={val} onValueChange={setVal} disablePreventBodyScroll {...props}>
            <Select.Trigger width={220} iconAfter={ChevronDown}>
                <Select.Value placeholder="Something" />
            </Select.Trigger>

            <Select.Content zIndex={200000}>
                <Select.ScrollUpButton
                    items="center"
                    justify="center"
                    position="relative"
                    width="100%"
                    height="$3">
                    <YStack z={10}>
                        <ChevronUp size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['$background', 'transparent']}
                        borderCurve="circular"
                    />
                </Select.ScrollUpButton>

                <Select.Viewport
                    // to do animations:
                    // animation="quick"
                    // animateOnly={['transform', 'opacity']}
                    // enterStyle={{ o: 0, y: -10 }}
                    // exitStyle={{ o: 0, y: 10 }}
                    minW={200}>
                    <Select.Group>
                        {/* for longer lists memoizing these is useful */}
                        {React.useMemo(
                            () =>
                                props.items.map((item, i) => {
                                    return (
                                        <Select.Item index={i} key={item.value} value={item.value}>
                                            <Select.ItemText>{item.name}</Select.ItemText>
                                            <Select.ItemIndicator marginLeft="auto">
                                                <Check size={16} />
                                            </Select.ItemIndicator>
                                        </Select.Item>
                                    );
                                }),
                            [props.items],
                        )}
                    </Select.Group>
                    {/* Native gets an extra icon */}
                    {props.native && (
                        <YStack
                            position="absolute"
                            r={0}
                            t={0}
                            b={0}
                            items="center"
                            justify="center"
                            width={'$4'}
                            pointerEvents="none">
                            <ChevronDown
                                size={getFontSize((props.size as FontSizeTokens) ?? '$true')}
                            />
                        </YStack>
                    )}
                </Select.Viewport>

                <Select.ScrollDownButton
                    items="center"
                    justify="center"
                    position="relative"
                    width="100%"
                    height="$3">
                    <YStack z={10}>
                        <ChevronDown size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['transparent', '$background']}
                        borderCurve="circular"
                    />
                </Select.ScrollDownButton>
            </Select.Content>
        </Select>
    );
};

type SelectFieldProps = SelectItemProps & {
    id: string;
    label?: string;
};

const categories: SelectItemValue[] = [
    { name: 'Category 1', value: 'category1' },
    { name: 'Category 2', value: 'category2' },
    { name: 'Category 3', value: 'category3' },
];

export const SelectField = ({ label, id, ...props }: SelectFieldProps) => {
    return (
        <YStack>
            {label && (
                <Label htmlFor={id} flex={1} minW={80}>
                    {label}
                </Label>
            )}
            <SelectItem id={id} {...props} />
        </YStack>
    );
};

export function CategorySelect() {
    // TODO: this should be select
    return <SelectField id="category" label="Category" items={categories} />;
}

// TODO: add react hook form
export default function CreateTransaction() {
    const isLoading = false;
    const onSubmit = () => {
        console.log('onSubmit');
    };
    return (
        <YStack>
            <Form gap="$2" onSubmit={onSubmit}>
                <InputField label="Name" placeholder="Name" id="name" />
                {/* TODO: should be text but accept numbers and later sum equasions */}
                <InputField label="Amount" placeholder="Amount" id="amount" />
                <IsExpenseController />
                <InputField label="Date" placeholder="Date" id="date" />
                <CategorySelect />
                <TextAreaField label="Description" placeholder="Description" id="description" />
                <Form.Trigger asChild disabled={isLoading}>
                    <Button icon={isLoading ? <Spinner /> : undefined}>Submit</Button>
                </Form.Trigger>
            </Form>
        </YStack>
    );
}
