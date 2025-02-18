import { CirclePlus, Trash } from '@tamagui/lucide-icons';
import { ListItem, XStack, Text } from 'tamagui';
import { CategoryDto, UpdateCategoryDto } from '../api/types';
import { icons } from '@/consts/icons';
import { useMutationState } from '@tanstack/react-query';
import { categoriesKeys } from '../api/query';

type CategoryParentProps = {
    category: CategoryDto;
    onDelete?: () => void;
    onCreateSubcategory?: () => void;
    isGhost?: boolean;
    onEdit?: () => void;
};

export const CategoryParent = ({
    category,
    onDelete,
    onCreateSubcategory,
    isGhost,
    onEdit,
}: CategoryParentProps) => {
    const updatedCategories = useMutationState<UpdateCategoryDto>({
        filters: { mutationKey: categoriesKeys.update(), status: 'pending' },
        select: (mutation) => mutation.state.variables as UpdateCategoryDto,
    });

    const updatedData = updatedCategories.find((c) => c.id === category.id);
    const isLoading = Boolean(updatedData || isGhost);
    const data = updatedData || category;

    return (
        <ListItem
            borderColor="$color4"
            hoverStyle={{
                bg: '$backgroundHover',
                cursor: 'pointer',
            }}
            borderBottomWidth={1}
            opacity={isLoading ? 0.6 : 1}
            disabled={isLoading}
            iconAfter={
                <XStack gap="$4">
                    <CirclePlus
                        hoverStyle={{
                            bg: '$colorHover',
                        }}
                        disabled={isLoading}
                        onPress={onCreateSubcategory}
                    />
                    <Trash disabled={isLoading} onPress={onDelete} />
                </XStack>
            }>
            <XStack onPress={onEdit} flex={1} items="center" gap="$3">
                {icons.find((icon) => icon.name === data.icon)?.icon(data.icon_color)}
                <Text>{data.name}</Text>
            </XStack>
        </ListItem>
    );
};
