import { SelectOption } from '@/components/select-field';
import { CategoriesSelectOptions, CategoriesWithChildren, CategoryDto } from './types';
import { icons } from '@/consts/icons';

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

export const formatTreeToSelectOptions = (
    tree: CategoriesWithChildren,
): CategoriesSelectOptions => {
    const mapCategoryToSelectOption = (category: CategoryDto) => {
        return {
            name: category.name,
            value: category.id,
            meta: {
                isParent: category.parent_id === null,
                default: category.default,
                type: category.type,
            },
            left: icons.find((icon) => icon.name === category.icon)?.icon(category.icon_color),
        };
    };
    return tree.reduce(
        (acc, category) => {
            const pushCategory = (cat: CategoryDto) => {
                acc.all.push(mapCategoryToSelectOption(cat));
                if (category.type === 'income') {
                    acc.income.push(mapCategoryToSelectOption(cat));
                }
                if (category.type === 'expense') {
                    acc.expense.push(mapCategoryToSelectOption(cat));
                }
            };
            pushCategory(category);

            if (category.children) {
                category.children.forEach((child) => pushCategory(child));
            }

            return acc;
        },
        {
            all: [] as SelectOption[],
            expense: [] as SelectOption[],
            income: [] as SelectOption[],
        },
    );
};
