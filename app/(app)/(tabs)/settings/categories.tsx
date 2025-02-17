import { useState } from 'react';
import { Button } from '@/components/button';
import { categoriesKeys, useGetCategories } from '@/features/categories/api/query';
import { CirclePlus } from '@tamagui/lucide-icons';
import { ScrollView, YGroup, YStack } from 'tamagui';
import { CategoryDto, CreateCategoryDto } from '@/features/categories/api/types';
import { Sheet } from '@/components/sheet';
import { useMutationState } from '@tanstack/react-query';
import { CategoryChild } from '@/features/categories/components/category-child';
import { CategoryParent } from '@/features/categories/components/category-parent';
import { CreateCategoryForm } from '@/features/categories/components/create-category-form';
import { DeleteConfirmationSheet } from '@/features/categories/components/delete-confirmation-sheet';

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || [];
    const [open, setOpen] = useState(false);
    const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryDto | null>(null);

    const openSheet = () => {
        setOpen(true);
    };
    const closeSheet = () => {
        setOpen(false);
    };
    const openUpdateSheet = (id: CategoryDto['id']) => {
        setParentId(id);
        setUpdateSheetOpen(true);
    };
    const closeUpdateSheetSheet = () => {
        setUpdateSheetOpen(false);
        setParentId(undefined);
    };

    const openDeleteConfirmationSheet = (category: CategoryDto) => {
        setCategoryToDelete(category);
        setDeleteConfirmationOpen(true);
    };

    const newCategories = useMutationState<CreateCategoryDto>({
        filters: { mutationKey: categoriesKeys.create(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CreateCategoryDto,
    });
    const removedCategoriesIds = useMutationState<CategoryDto['id']>({
        filters: { mutationKey: categoriesKeys.delete(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CategoryDto['id'],
    });

    return (
        <YStack gap="$4" p="$2">
            <ScrollView>
                <YGroup size="$4">
                    {newCategories.map((newCategory, index) => {
                        return (
                            <YGroup.Item key={index}>
                                <CategoryParent
                                    category={{ ...newCategory, id: new Date().toString() }}
                                />
                            </YGroup.Item>
                        );
                    })}
                    {categoriesTree.map((category) => {
                        const children = category.children;

                        if (removedCategoriesIds.includes(category.id)) {
                            return null;
                        }

                        return (
                            <YGroup.Item key={category.id}>
                                <YStack>
                                    <CategoryParent
                                        category={category}
                                        onDelete={() => openDeleteConfirmationSheet(category)}
                                    />
                                    <YStack>
                                        {children && (
                                            <YGroup>
                                                {children.map((child) => {
                                                    if (removedCategoriesIds.includes(child.id)) {
                                                        return null;
                                                    }
                                                    return (
                                                        <YGroup.Item key={child.id}>
                                                            <CategoryChild
                                                                category={child}
                                                                onDelete={() =>
                                                                    openDeleteConfirmationSheet(
                                                                        child,
                                                                    )
                                                                }
                                                            />
                                                        </YGroup.Item>
                                                    );
                                                })}
                                            </YGroup>
                                        )}
                                    </YStack>
                                </YStack>
                            </YGroup.Item>
                        );
                    })}
                </YGroup>
            </ScrollView>
            <Button icon={<CirclePlus />} onPress={openSheet}>
                Add category
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <CreateCategoryForm autoFocus={open} onSubmit={closeSheet} />
            </Sheet>
            <Sheet open={updateSheetOpen} onOpenChange={setUpdateSheetOpen}>
                <CreateCategoryForm autoFocus={updateSheetOpen} onSubmit={closeUpdateSheetSheet} />
            </Sheet>
            <DeleteConfirmationSheet
                open={deleteConfirmationOpen}
                category={categoryToDelete}
                onOpenChange={setDeleteConfirmationOpen}
            />
        </YStack>
    );
}
