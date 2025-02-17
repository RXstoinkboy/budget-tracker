import { CirclePlus, Trash } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { ListItem, XStack, Text } from 'tamagui';
import { CategoryDto } from '../api/types';

type CategoryParentProps = {
    category: CategoryDto;
    onDelete?: () => void;
};

export const CategoryParent = ({ category, onDelete }: CategoryParentProps) => {
    return (
        <ListItem borderColor="$color4" borderBottomWidth={1}>
            <XStack flex={1} items="center" justify={'space-between'}>
                <Text>{category.name}</Text>
                <XStack gap="$4">
                    <CirclePlus />
                    <Pressable disabled={!onDelete} onPress={onDelete}>
                        <Trash opacity={onDelete ? 1 : 0.6} />
                    </Pressable>
                </XStack>
            </XStack>
        </ListItem>
    );
};
