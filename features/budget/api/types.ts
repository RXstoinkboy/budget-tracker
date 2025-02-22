import { DateTime } from 'luxon';

export type BudgetDto = {
    id: string;
    amount: number;
    description: string;
    category_id: string;
    start_date: string;
    end_date: string;
};

export type CreateBudgetDto = Omit<BudgetDto, 'id'>;

export type BudgetFilters = {
    start_date: DateTime;
    end_date: DateTime;
};
