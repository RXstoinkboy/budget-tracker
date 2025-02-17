import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { SheetProps, YStack, Paragraph, XStack } from 'tamagui';
import { useDeleteCategory } from '../api/query';
import { CategoryDto } from '../api/types';

type DeleteConfirmationSheetProps = SheetProps & {
    category: CategoryDto | null;
};

export const DeleteConfirmationSheet = ({
    open,
    onOpenChange,
    category,
}: DeleteConfirmationSheetProps) => {
    const deleteCategory = useDeleteCategory();
    const isParent = category?.parent_id === null;

    const onDelete = () => {
        if (category) {
            deleteCategory.mutate(category.id);
            onOpenChange?.(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <YStack p="$4">
                <Paragraph>
                    Are you sure you want to delete {category?.name} category
                    {isParent ? ` and all it's children?` : '?'}
                </Paragraph>
                <XStack gap="$2">
                    <Button danger onPress={onDelete}>
                        Delete
                    </Button>
                    <Button variant="outlined" onPress={() => onOpenChange?.(false)}>
                        Cancel
                    </Button>
                </XStack>
            </YStack>
        </Sheet>
    );
};
