export type CategoryDto = {
    id: string;
    name: string;
    icon: string;
    icon_color: string;
    parent_id: string | null;
    type: string;
};

export type CategoryWithChildren = CategoryDto & { children: CategoryDto[] };
export type CategoriesWithChildren = CategoryWithChildren[];

export type CreateCategoryDto = Omit<CategoryDto, 'id'>;
export type UpdateCategoryDto = CategoryDto & {
    options?: {
        updateChildren?: boolean;
    };
};
