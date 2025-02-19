import { useState } from 'react';
import { Button } from '@/components/button';
import { categoriesKeys, useGetCategories } from '@/features/categories/api/query';
import { CirclePlus } from '@tamagui/lucide-icons';
import { ScrollView, YGroup, YStack } from 'tamagui';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@/features/categories/api/types';
import { Sheet } from '@/components/sheet';
import { useMutationState } from '@tanstack/react-query';
import { CategoryChild } from '@/features/categories/components/category-child';
import { CategoryParent } from '@/features/categories/components/category-parent';
import { CreateCategoryForm } from '@/features/categories/components/category-form/create-category-form';
import { EditCategoryForm } from '@/features/categories/components/category-form/edit-category-form';
import { DeleteConfirmationSheet } from '@/features/categories/components/delete-confirmation-sheet';
import { CreateSubcategoryForm } from '@/features/categories/components/category-form/create-subcategory-form';
import { MoveCategoryForm } from '@/features/categories/components/category-form/move-category-form';

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || [];
    const [open, setOpen] = useState(false);
    const [parentCategory, setParentCategory] = useState<CategoryDto | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryDto | null>(null);
    const [categoryToMove, setCategoryToMove] = useState<CategoryDto | null>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryDto | null>(null);

    // TODO: this sucks - refactor all of these forms and modal opening...
    // TODO: also, this is a mess - there are so many different states and so many different ways to open them
    const openSheet = () => {
        setCategoryToMove(null);
        setCategoryToEdit(null);
        setParentCategory(null);
        setOpen(true);
    };
    const closeSheet = () => {
        setOpen(false);
    };
    const openCreateSubcategorySheet = (parentId: CategoryDto) => {
        setCategoryToEdit(null);
        setCategoryToMove(null);
        setParentCategory(parentId);
        setOpen(true);
    };
    const openDeleteConfirmationSheet = (category: CategoryDto) => {
        setCategoryToDelete(category);
        setDeleteConfirmationOpen(true);
    };
    const openEditCategorySheet = (
        category: CategoryDto,
        parentCategory: CategoryDto | null = null,
    ) => {
        setCategoryToEdit(category);
        setParentCategory(parentCategory);
        setOpen(true);
    };
    const openMoveCategorySheet = (category: CategoryDto) => {
        setCategoryToMove(category);
        setParentCategory(null);
        setOpen(true);
    };

    const newCategories = useMutationState<CreateCategoryDto>({
        filters: { mutationKey: categoriesKeys.create(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CreateCategoryDto,
    });
    const removedCategoriesIds = useMutationState<CategoryDto['id']>({
        filters: { mutationKey: categoriesKeys.delete(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CategoryDto['id'],
    });
    const updatedCategories = useMutationState<UpdateCategoryDto>({
        filters: { mutationKey: categoriesKeys.update(), status: 'pending' },
        select: (mutation) => mutation.state.variables as UpdateCategoryDto,
    });

    return (
        <YStack gap="$4" p="$2">
            <ScrollView>
                <YGroup size="$4">
                    {/* render newly created category */}
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

                        // don't render category that is being deleted
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
                                        onEdit={() => openEditCategorySheet(category)}
                                    />
                                    <YStack>
                                        {children && (
                                            <YGroup>
                                                {/* render newly create category and updated category */}
                                                {[...newCategories, ...updatedCategories].map(
                                                    (newChild, index) => {
                                                        if (newChild.parent_id === category.id) {
                                                            return (
                                                                <YGroup.Item key={index}>
                                                                    <CategoryChild
                                                                        isGhost
                                                                        parentId={category.id}
                                                                        category={{
                                                                            ...newChild,
                                                                            id: new Date().toString(),
                                                                        }}
                                                                    />
                                                                </YGroup.Item>
                                                            );
                                                        }
                                                        return null;
                                                    },
                                                )}
                                                {children.map((child) => {
                                                    // don't render subcategory that is being moved to other parent
                                                    if (
                                                        updatedCategories.some(
                                                            (c) =>
                                                                c.id === child.id &&
                                                                c.parent_id !== child.parent_id,
                                                        )
                                                    ) {
                                                        return null;
                                                    }
                                                    // don't render subcategory that is being deleted
                                                    if (removedCategoriesIds.includes(child.id)) {
                                                        return null;
                                                    }
                                                    return (
                                                        <YGroup.Item key={child.id}>
                                                            <CategoryChild
                                                                parentId={category.id}
                                                                category={child}
                                                                onDelete={() =>
                                                                    openDeleteConfirmationSheet(
                                                                        child,
                                                                    )
                                                                }
                                                                onEdit={() =>
                                                                    openEditCategorySheet(
                                                                        child,
                                                                        category,
                                                                    )
                                                                }
                                                                onMove={() =>
                                                                    openMoveCategorySheet(child)
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
                {parentCategory && !categoryToEdit && (
                    <CreateSubcategoryForm
                        autoFocus={open}
                        onSubmit={closeSheet}
                        parentCategory={parentCategory}
                    />
                )}
                {categoryToEdit && parentCategory && (
                    <EditCategoryForm
                        autoFocus={open}
                        onSubmit={closeSheet}
                        category={categoryToEdit}
                        isSubcategory
                    />
                )}
                {!categoryToMove && categoryToEdit && !parentCategory && (
                    <EditCategoryForm
                        autoFocus={open}
                        onSubmit={closeSheet}
                        category={categoryToEdit}
                    />
                )}
                {categoryToMove && !parentCategory && (
                    <MoveCategoryForm
                        autoFocus={open}
                        onSubmit={closeSheet}
                        category={categoryToMove}
                    />
                )}
                {!parentCategory && !categoryToEdit && !categoryToMove && (
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
