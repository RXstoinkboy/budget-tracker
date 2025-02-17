import { z } from 'zod';
import { CategoryDto } from '@/features/categories/api/types';
import { CategoryFormSchema } from './schema';

export type CategoryFormType = z.infer<typeof CategoryFormSchema>;

export type CategoryFormProps = {
    onSubmit: () => void;
    autoFocus?: boolean;
};

export type SubcategoryFormProps = CategoryFormProps & {
    parentCategory: CategoryDto | null;
};
