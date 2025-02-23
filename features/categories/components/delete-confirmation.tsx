import { useDeleteCategory } from '../api/query';
import { CategoryDto } from '../api/types';
import { DeleteConfirmation, DeleteConfirmationProps } from '@/components/delete-confirmation';

type DeleteConfirmationSheetProps = Omit<DeleteConfirmationProps, 'title' | 'onDelete'> & {
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
        <DeleteConfirmation
            open={open}
            onOpenChange={onOpenChange}
            onDelete={onDelete}
            title={`Are you sure you want to delete ${category?.name} category ${isParent ? " and all it's children" : ''}?`}
        />
    );
};
