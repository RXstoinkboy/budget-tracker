import { CirclePlus, Trash } from '@tamagui/lucide-icons';
import { ListItem, XStack, Text } from 'tamagui';
import { CategoryDto } from '../api/types';

type CategoryParentProps = {
    category: CategoryDto;
    onDelete?: () => void;
    onCreateSubcategory?: () => void;
    isGhost?: boolean;
};

export const CategoryParent = ({
    category,
    onDelete,
    onCreateSubcategory,
    isGhost,
}: CategoryParentProps) => {
    return (
        <ListItem borderColor="$color4" borderBottomWidth={1} opacity={isGhost ? 0.6 : 1}>
            <XStack flex={1} items="center" justify={'space-between'}>
                <Text>{category.name}</Text>
                <XStack gap="$4">
                    <CirclePlus onPress={onCreateSubcategory} />
                    <Trash onPress={onDelete} />
                </XStack>
            </XStack>
        </ListItem>
    );
};
