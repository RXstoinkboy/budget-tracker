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
import { CreateCategoryForm } from '@/features/categories/components/category-form/create-category-form';
import { DeleteConfirmationSheet } from '@/features/categories/components/delete-confirmation-sheet';
import { CreateSubcategoryForm } from '@/features/categories/components/category-form/create-subcategory-form';

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || [];
    const [open, setOpen] = useState(false);
    const [parentCategory, setParentCategory] = useState<CategoryDto | null>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryDto | null>(null);

    const openSheet = () => {
        setParentCategory(null);
        setOpen(true);
    };
    const closeSheet = () => {
        setOpen(false);
    };
    const openCreateSubcategorySheet = (parentId: CategoryDto) => {
        setParentCategory(parentId);
        setOpen(true);
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
                        if (newCategory.parent_id === null) {
                            return (
                                <YGroup.Item key={index}>
                                    <CategoryParent
                                        isGhost
                                        category={{ ...newCategory, id: new Date().toString() }}
                                    />
                                </YGroup.Item>
                            );
                        }
                        return null;
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
                                        onCreateSubcategory={() =>
                                            openCreateSubcategorySheet(category)
                                        }
                                    />
                                    <YStack>
                                        {children && (
                                            <YGroup>
                                                {newCategories.map((newChild, index) => {
                                                    if (newChild.parent_id === category.id) {
                                                        return (
                                                            <YGroup.Item key={index}>
                                                                <CategoryChild
                                                                    isGhost
                                                                    category={{
                                                                        ...newChild,
                                                                        id: new Date().toString(),
                                                                    }}
                                                                />
                                                            </YGroup.Item>
                                                        );
                                                    }
                                                    return null;
                                                })}
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
                {parentCategory ? (
                    <CreateSubcategoryForm
                        autoFocus={open}
                        onSubmit={closeSheet}
                        parentCategory={parentCategory}
                    />
                ) : (
                    <CreateCategoryForm autoFocus={open} onSubmit={closeSheet} />
                )}
            </Sheet>
            <DeleteConfirmationSheet
                open={deleteConfirmationOpen}
                category={categoryToDelete}
                onOpenChange={setDeleteConfirmationOpen}
            />
        </YStack>
    );
}
