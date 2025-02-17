import { Dot, FolderOutput, Trash } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { ListItem, XStack, Text } from 'tamagui';
import { CategoryDto } from '../api/types';

type CategoryChilProps = {
    category: CategoryDto;
    onDelete?: () => void;
};

export const CategoryChild = ({ category, onDelete }: CategoryChilProps) => {
    return (
        <ListItem icon={<Dot color="$color10" />}>
            <XStack flex={1} items="center" justify={'space-between'}>
                <Text>{category.name}</Text>
                <XStack gap="$4">
                    <FolderOutput />
                    <Pressable disabled={!onDelete} onPress={onDelete}>
                        <Trash opacity={onDelete ? 1 : 0.6} />
                    </Pressable>
                </XStack>
            </XStack>
        </ListItem>
    );
};
