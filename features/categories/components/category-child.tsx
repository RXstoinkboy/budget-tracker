import { Dot, FolderOutput, Trash } from '@tamagui/lucide-icons';
import { ListItem, XStack, Text, View } from 'tamagui';
import { CategoryDto, UpdateCategoryDto } from '../api/types';
import { useMutationState } from '@tanstack/react-query';
import { categoriesKeys } from '../api/query';

type CategoryChilProps = {
    category: CategoryDto;
    parentId: string;
    onDelete?: () => void;
    onEdit?: () => void;
    onMove?: () => void;
    isGhost?: boolean;
};

export const CategoryChild = ({
    isGhost,
    category,
    parentId,
    onDelete,
    onEdit,
    onMove,
}: CategoryChilProps) => {
    const updatedCategories = useMutationState<UpdateCategoryDto>({
        filters: { mutationKey: categoriesKeys.update(), status: 'pending' },
        select: (mutation) => mutation.state.variables as UpdateCategoryDto,
    });

    const updatedData = updatedCategories.find(
        (c) => c.id === category.id && parentId === c.parent_id,
    );
    const isLoading = Boolean(updatedData || isGhost);
    const data = updatedData || category;

    return (
        <ListItem
            opacity={isLoading ? 0.6 : 1}
            hoverStyle={{
                bg: '$backgroundHover',
                cursor: 'pointer',
            }}
            disabled={isLoading}
            iconAfter={
                <XStack gap="$4">
                    <FolderOutput disabled={isLoading} onPress={onMove} />
                    {category.default ? (
                        <View width={'$1.5'} />
                    ) : (
                        <Trash disabled={isLoading} onPress={onDelete} />
                    )}
                </XStack>
            }>
            <XStack flex={1} items="center" gap="$3" onPress={onEdit}>
                <Dot color="$color10" />
                <Text>{data.name}</Text>
            </XStack>
        </ListItem>
    );
};
