import { CategoryDto } from './types';

export const formatToCategoryTree = (categories: CategoryDto[]) => {
    return categories.reduce(
        (acc, category) => {
            if (!category.parent_id) {
                acc[category.id] = { ...category, children: [] };
            } else {
                acc[category.parent_id].children?.push(category);
            }

            return acc;
        },
        {} as Record<string, CategoryDto & { children?: CategoryDto[] }>,
    );
};
