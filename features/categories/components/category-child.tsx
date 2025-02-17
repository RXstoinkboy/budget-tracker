import { Dot, FolderOutput, Trash } from '@tamagui/lucide-icons';
import { ListItem, XStack, Text } from 'tamagui';
import { CategoryDto } from '../api/types';

type CategoryChilProps = {
    category: CategoryDto;
    onDelete?: () => void;
    isGhost?: boolean;
};

export const CategoryChild = ({ isGhost, category, onDelete }: CategoryChilProps) => {
    return (
        <ListItem icon={<Dot color="$color10" />} opacity={isGhost ? 0.6 : 1}>
            <XStack flex={1} items="center" justify={'space-between'}>
                <Text>{category.name}</Text>
                <XStack gap="$4">
                    <FolderOutput />
                    <Trash onPress={onDelete} />
                </XStack>
            </XStack>
        </ListItem>
    );
};
