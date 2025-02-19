import { z } from 'zod';
import { CategoryDto } from '@/features/categories/api/types';
import { CategoryFormSchema, MoveCategoryFormSchema } from './schema';

export type CategoryFormType = z.infer<typeof CategoryFormSchema>;
export type MoveCategoryFormType = z.infer<typeof MoveCategoryFormSchema>;

export type CategoryFormProps = {
    onSubmit: () => void;
    autoFocus?: boolean;
};

export type SubcategoryFormProps = CategoryFormProps & {
    parentCategory: CategoryDto | null;
};

export type EditCategoryFormProps = CategoryFormProps & {
    category: CategoryDto;
    isSubcategory?: boolean;
    isMove?: boolean;
};
