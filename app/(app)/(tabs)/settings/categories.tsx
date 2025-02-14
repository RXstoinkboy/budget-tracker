import { Button } from '@/components/button';
import { useGetCategories } from '@/features/categories/api/query';
import { CirclePlus, Dot, FolderOutput, Trash } from '@tamagui/lucide-icons';
import { ListItem, ScrollView, XStack, YGroup, YStack, Text } from 'tamagui';

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || {};

    return (
        <YStack gap="$4" p="$2">
            <Button icon={<CirclePlus />}>Add category</Button>
            <ScrollView>
                <YGroup size="$4">
                    {Object.keys(categoriesTree).map((categoryId) => {
                        const category = categoriesTree[categoryId];
                        const children = category.children;
                        return (
                            <YGroup.Item key={categoryId}>
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
        </YStack>
    );
}
