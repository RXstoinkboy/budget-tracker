import { supabase } from '@/utils/supabase';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    // list: (filters: string) => [...transactionsKeys.lists(), { filters }] as const,
    // details: () => [...transactionsKeys.all, 'detail'] as const,
    // detail: (id: number) => [...transactionsKeys.details(), id] as const,
};

const createTransaction = async () => {
    const { error } = await supabase.from('transactions').insert({
        name: 'test from app 1',
        amount: 100.01,
        description: 'test description',
        // transaction_date: null,
        receiptUrl: null,
        expense: true,
        category_id: null,
    });

    if (error) {
        throw error;
    }
};

const getTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*');

    if (error) {
        throw error;
    }

    return data;
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        // TODO: optimistic UI update
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
    });
};

export const useGetTransactions = () => {
    return useQuery({
        queryKey: transactionsKeys.lists(),
        queryFn: getTransactions,
    });
};
