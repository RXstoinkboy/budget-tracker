import { SelectOption } from '@/components/select-field';
import { CategoriesWithChildren, CategoryDto } from './types';

export const formatToCategoryTree = (categories: CategoryDto[]) => {
    return categories.reduce((acc, category) => {
        if (!category.parent_id) {
            acc.push({ ...category, children: [] });
        } else {
            acc.find((c) => c.id === category.parent_id)?.children?.push(category);
        }

        return acc;
    }, [] as CategoriesWithChildren);
};

export const formatTreeToSelectOptions = (tree: CategoriesWithChildren) => {
    const mapCategoryToSelectOption = (category: CategoryDto) => {
        return {
            name: category.name,
            value: category.id,
        };
    };
    return tree.reduce((acc, category) => {
        acc.push(mapCategoryToSelectOption(category));

        if (category.children) {
            category.children.forEach((child) => acc.push(mapCategoryToSelectOption(child)));
        }

        return acc;
    }, [] as SelectOption[]);
};
