import { useState } from 'react';
import { Button } from '@/components/button';
import { useGetCategories } from '@/features/categories/api/query';
import { CirclePlus, Dot, FolderOutput, Trash } from '@tamagui/lucide-icons';
import { ListItem, ScrollView, XStack, YGroup, YStack, Text, Sheet, SheetProps } from 'tamagui';

// TODO: this should be a reusable component in different directory
type CreateNewCategorySheetProps = Pick<SheetProps, 'open' | 'onOpenChange'>;

const CreateNewCategorySheet = (props: CreateNewCategorySheetProps) => {
    const [position, setPosition] = useState(0);

    return (
        <Sheet
            forceRemoveScrollEnabled={props.open}
            modal
            open={props.open}
            onOpenChange={props.onOpenChange}
            snapPointsMode={'percent'}
            dismissOnSnapToBottom
            position={position}
            onPositionChange={setPosition}
            zIndex={100_000}
            animation="medium">
            <Sheet.Overlay
                animation="lazy"
                bg="$shadow6"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <Sheet.Handle />
            <Sheet.Frame p="$4" justify="center" items="center" gap="$5">
                <Text>Create new category</Text>
            </Sheet.Frame>
        </Sheet>
    );
};

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || [];
    const [open, setOpen] = useState(false);

    const openSheet = () => setOpen(true);

    return (
        <YStack gap="$4" p="$2">
            <Button icon={<CirclePlus />} onPress={openSheet}>
                Add category
            </Button>
            <ScrollView>
                <YGroup size="$4">
                    {categoriesTree.map((category) => {
                        const children = category.children;
                        return (
                            <YGroup.Item key={category.id}>
                                <YStack>
                                    <ListItem borderColor="$color4" borderBottomWidth={1}>
                                        <XStack flex={1} items="center" justify={'space-between'}>
                                            <Text>{category.name}</Text>
                                            <XStack gap="$4">
                                                <CirclePlus />
                                                <Trash />
                                            </XStack>
                                        </XStack>
                                    </ListItem>
                                    <YStack>
                                        {children && (
                                            <YGroup>
                                                {children.map((child) => (
                                                    <YGroup.Item key={child.id}>
                                                        <ListItem icon={<Dot color="$color10" />}>
                                                            <XStack
                                                                flex={1}
                                                                items="center"
                                                                justify={'space-between'}>
                                                                <Text>{child.name}</Text>
                                                                <XStack gap="$4">
                                                                    <FolderOutput />
                                                                    <Trash />
                                                                </XStack>
                                                            </XStack>
                                                        </ListItem>
                                                    </YGroup.Item>
                                                ))}
                                            </YGroup>
                                        )}
                                    </YStack>
                                </YStack>
                            </YGroup.Item>
                        );
                    })}
                </YGroup>
            </ScrollView>
            <CreateNewCategorySheet open={open} onOpenChange={setOpen} />
        </YStack>
    );
}
