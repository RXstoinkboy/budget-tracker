import { supabase } from '@/utils/supabase';
import { BudgetDto, BudgetFilters, CreateBudgetDto } from './types';
import { DateTime } from 'luxon';
import { MutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryDto } from '@/features/categories/api/types';
import { categoriesKeys } from '@/features/categories/api/query';

export const budgetKeys = {
    all: ['budget'] as const,
    lists: () => [...budgetKeys.all, 'list'] as const,
    // TODO: this will be filtered by period
    list: (filters: BudgetFilters) => [...budgetKeys.lists(), { filters }] as const,
    details: () => [...budgetKeys.all, 'detail'] as const,
    detail: (id: string) => [...budgetKeys.details(), id] as const,
    create: () => [...budgetKeys.all, 'create'] as const,
    update: () => [...budgetKeys.all, 'update'] as const,
    delete: () => [...budgetKeys.all, 'delete'] as const,
};

export const DEFAULT_FILTERS: BudgetFilters = {
    start_date: DateTime.now().startOf('month'),
    end_date: DateTime.now().endOf('month'),
};

const createBudget = async (data: CreateBudgetDto) => {
    const { error } = await supabase.from('budget').insert(data);

    if (error) {
        throw error;
    }
};

const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budget').delete().eq('id', id);

    if (error) {
        throw error;
    }
};

const getBudgetList = async (filters: BudgetFilters) => {
    const { data, error } = await supabase
        .from('budget')
        .select('*, category:category_id (name, icon, icon_color)')
        .filter('start_date', 'gte', filters.start_date.toISODate())
        .filter('end_date', 'lte', filters.end_date.toISODate())
        .order('category_id');

    if (error) {
        throw error;
    }

    return data;
};

const getBudgetDetails = async (id: string) => {
    const { data, error } = await supabase.from('budget').select('*').eq('id', id);

    if (error) {
        throw error;
    }

    return data[0];
};

export const useCreateBudget = ({
    onMutate,
    onSettled,
    onError,
    ...options
}: MutationOptions<unknown, Error, CreateBudgetDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: budgetKeys.create(),
        mutationFn: createBudget,
        onMutate: async (variables) => {
            const previousBudgetList = queryClient.getQueryData<BudgetDto[]>(
                budgetKeys.list(DEFAULT_FILTERS),
            );
            const categories = queryClient.getQueryData<CategoryDto[]>(categoriesKeys.list());
            const category = categories?.find(({ id }) => id === variables.category_id);

            const newBudgetElement = {
                id: new Date().toString(),
                category,
                ...variables,
            };
            queryClient.setQueryData(budgetKeys.list(DEFAULT_FILTERS), [
                newBudgetElement,
                ...(previousBudgetList ?? []),
            ]);

            onMutate?.(variables);

            return { previousBudgetList };
        },
        onError: (error, data, context: { previousBudget?: CreateBudgetDto }) => {
            onError?.(error, data, context);

            console.error('--> create budget error', error);
        },
        onSettled: async (data, error, variables, context) => {
            onSettled?.(data, error, variables, context);

            return queryClient.invalidateQueries({
                queryKey: budgetKeys.list(DEFAULT_FILTERS),
            });
        },
        ...options,
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, string>({
        mutationFn: deleteBudget,
        onMutate: async (id) => {
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: budgetKeys.list(DEFAULT_FILTERS),
                }),
                queryClient.cancelQueries({
                    queryKey: budgetKeys.detail(id),
                }),
            ]);
            const previousBudgetList = queryClient.getQueryData<BudgetDto[]>(
                budgetKeys.list(DEFAULT_FILTERS),
            );

            const updatedBudgetList = previousBudgetList?.filter((budget) => budget.id !== id);

            queryClient.setQueryData(budgetKeys.list(DEFAULT_FILTERS), updatedBudgetList);

            return { previousBudgetList };
        },
        onError: (error, data, context: { previousBudget?: BudgetDto[] }) => {
            queryClient.setQueryData(budgetKeys.list(DEFAULT_FILTERS), context?.previousBudget);
            console.error('--> delete budget error', error);
        },
        onSettled: () => {
            return queryClient.invalidateQueries({
                queryKey: budgetKeys.list(DEFAULT_FILTERS),
            });
        },
    });
};

export const useGetBudgetList = (filters = DEFAULT_FILTERS) => {
    return useQuery({
        queryKey: budgetKeys.list(filters),
        queryFn: () => getBudgetList(filters),
    });
};

export const useGetBudgetDetails = (id: string) => {
    return useQuery({
        queryKey: budgetKeys.detail(id),
        queryFn: () => getBudgetDetails(id),
    });
};
