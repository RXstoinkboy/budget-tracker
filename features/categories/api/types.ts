import { SelectOption } from '@/components/select-field';

export type CategoryDto = {
    id: string;
    name: string;
    icon: string;
    icon_color: string;
    parent_id: string | null;
    type: string;
    default: boolean;
};

export type CategoryWithChildren = CategoryDto & { children: CategoryDto[] };
export type CategoriesWithChildren = CategoryWithChildren[];
export type CategoriesSelectOptions = {
    all: SelectOption[];
    expense: SelectOption[];
    income: SelectOption[];
};

export type CreateCategoryDto = Omit<CategoryDto, 'id' | 'default'>;
export type UpdateCategoryDto = Omit<CategoryDto, 'default'> & {
    options?: {
        updateChildren?: boolean;
    };
};
