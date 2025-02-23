import { CategoryDto } from '@/features/categories/api/types';
import { DateTime } from 'luxon';

export type BudgetDto = {
    id: string;
    amount: number;
    description: string;
    category_id: string;
    category: Pick<CategoryDto, 'name' | 'icon' | 'icon_color'>;
    start_date: string;
    end_date: string;
};

export type CreateBudgetDto = Omit<BudgetDto, 'id' | 'category'>;
export type UpdateBudgetDto = Omit<BudgetDto, 'category'>;

export type BudgetFilters = {
    start_date: DateTime;
    end_date: DateTime;
};
