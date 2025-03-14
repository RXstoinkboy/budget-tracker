import { SelectOption } from '@/components/select-field';
import { useGetCategories } from '@/features/categories/api/query';
import { CategoryDto } from '@/features/categories/api/types';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TransactionFormType } from '../schema';

const expenseToType = (expense?: string) => (expense === 'true' ? 'expense' : 'income');
const hideCategoriesOptionsBasedOnExpense = (cats: SelectOption[], expense?: string) => {
    return cats.map((opt) => {
        return {
            ...opt,
            meta: {
                ...opt.meta,
                hidden: opt.meta.type !== expenseToType(expense),
            },
        };
    });
};
const getDefaultCategoryId = (list: CategoryDto[], type: string = 'expense') => {
    const category = list.find((cat) => cat.default && cat.type === type);
    return category?.id;
};

export const useCategoriesOptions = (initialExpense: string = 'true') => {
    const categories = useGetCategories();
    const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>(
        hideCategoriesOptionsBasedOnExpense(
            categories.data?.selectOptions.all ?? [],
            initialExpense,
        ),
    );

    const updateCategoriesOptions = (expense?: string) => {
        setCategoriesOptions((prev) => hideCategoriesOptionsBasedOnExpense(prev, expense));
    };

    const updateCategoryId =
        (resetField: UseFormReturn<TransactionFormType>['resetField']) =>
        (expenseInner: 'true' | 'false') => {
            const typeInner = expenseInner === 'true' ? 'expense' : 'income';
            resetField('category_id', {
                defaultValue: getDefaultCategoryId(categories.data?.list ?? [], typeInner) ?? null,
            });
        };

    const updateCategoriesData =
        (resetField: UseFormReturn<TransactionFormType>['resetField']) =>
        (expenseInner: 'true' | 'false') => {
            updateCategoriesOptions(expenseInner);
            updateCategoryId(resetField)(expenseInner);
        };

    return {
        categoriesOptions,
        updateCategoriesData,
        getDefaultCategoryId,
    };
};
