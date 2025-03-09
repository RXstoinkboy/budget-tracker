import { useGetCategories } from '@/features/categories/api/query';
import { useGetBudgetList } from '../api/query';
import { BudgetDto } from '../api/types';

export const useAvailableBudgetCategories = (currentBudget?: BudgetDto) => {
    const { data } = useGetCategories();
    const budgetList = useGetBudgetList();
    const selectedOptions = budgetList.data?.budgets.map((budget) => budget.category_id) || [];

    const options =
        data?.selectOptions.filter((option) => {
            if (currentBudget?.category_id === option.value) {
                return true;
            }
            return !selectedOptions.includes(option.value);
        }) || [];

    const defaultValue = options.some((option) => option.value === null) ? null : options[0].value;

    return {
        options,
        defaultValue,
    };
};
