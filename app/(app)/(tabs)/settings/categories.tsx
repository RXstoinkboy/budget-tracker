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
import { DeleteConfirmationSheet } from '@/features/categories/components/delete-confirmation';
import { CreateSubcategoryForm } from '@/features/categories/components/category-form/create-subcategory-form';
import { MoveCategoryForm } from '@/features/categories/components/category-form/move-category-form';
import {
    useCreateCategorySheet,
    useCreateSubcategorySheet,
    useDeleteCategorySheet,
    useEditCategorySheet,
    useEditSubcategorySheet,
    useMoveCategorySheet,
} from '@/features/categories/components/category-form/hooks';

export default function Categories() {
    const categories = useGetCategories();
    const categoriesTree = categories.data?.tree || [];

    const createCategorySheet = useCreateCategorySheet();
    const createSubcategorySheet = useCreateSubcategorySheet();
    const deleteCategorySheet = useDeleteCategorySheet();
    const editCategorySheet = useEditCategorySheet();
    const editSubcategorySheet = useEditSubcategorySheet();
    const moveCategorySheet = useMoveCategorySheet();

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
                                        onDelete={() => deleteCategorySheet.open(category)}
                                        onCreateSubcategory={() =>
                                            createSubcategorySheet.open(category)
                                        }
                                        onEdit={() => editCategorySheet.open(category)}
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
                                                                    deleteCategorySheet.open(child)
                                                                }
                                                                onEdit={() =>
                                                                    editSubcategorySheet.open(
                                                                        child,
                                                                        category,
                                                                    )
                                                                }
                                                                onMove={() =>
                                                                    moveCategorySheet.open(child)
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
            <Button icon={<CirclePlus />} onPress={createCategorySheet.open}>
                Add category
            </Button>

            {/* TODO: this is already far better, but can also be moved to separate components */}
            <Sheet open={editCategorySheet.isOpen} onOpenChange={editCategorySheet.setIsOpen}>
                {editCategorySheet.category && (
                    <EditCategoryForm
                        autoFocus={editCategorySheet.isOpen}
                        onSubmit={editCategorySheet.close}
                        category={editCategorySheet.category}
                    />
                )}
            </Sheet>
            <Sheet open={moveCategorySheet.isOpen} onOpenChange={moveCategorySheet.setIsOpen}>
                {moveCategorySheet.category && (
                    <MoveCategoryForm
                        autoFocus={moveCategorySheet.isOpen}
                        onSubmit={moveCategorySheet.close}
                        category={moveCategorySheet.category}
                    />
                )}
            </Sheet>
            <Sheet open={createCategorySheet.isOpen} onOpenChange={createCategorySheet.setIsOpen}>
                <CreateCategoryForm
                    autoFocus={createCategorySheet.isOpen}
                    onSubmit={createCategorySheet.close}
                />
            </Sheet>
            <Sheet
                open={createSubcategorySheet.isOpen}
                onOpenChange={createSubcategorySheet.setIsOpen}>
                {createSubcategorySheet.parentCategory && (
                    <CreateSubcategoryForm
                        autoFocus={createSubcategorySheet.isOpen}
                        onSubmit={createSubcategorySheet.close}
                        parentCategory={createSubcategorySheet.parentCategory}
                    />
                )}
            </Sheet>
            <Sheet open={editSubcategorySheet.isOpen} onOpenChange={editSubcategorySheet.setIsOpen}>
                {editSubcategorySheet.category && (
                    <EditCategoryForm
                        autoFocus={editSubcategorySheet.isOpen}
                        onSubmit={editSubcategorySheet.close}
                        category={editSubcategorySheet.category}
                        isSubcategory
                    />
                )}
            </Sheet>
            <DeleteConfirmationSheet
                open={deleteCategorySheet.isOpen}
                category={deleteCategorySheet.category}
                onOpenChange={deleteCategorySheet.setIsOpen}
            />
        </YStack>
    );
}
