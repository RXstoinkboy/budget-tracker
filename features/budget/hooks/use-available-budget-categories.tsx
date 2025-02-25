import { useGetCategories } from '@/features/categories/api/query';
import { useGetBudgetList } from '../api/query';

export const useAvailableBudgetCategories = () => {
    const { data } = useGetCategories();
    const budgetList = useGetBudgetList();
    const selectedOptions = budgetList.data?.map((budget) => budget.category_id) || [];

    return data?.selectOptions.filter((option) => !selectedOptions.includes(option.value)) || [];
};
