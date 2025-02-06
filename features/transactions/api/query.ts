import { supabase } from '@/utils/supabase';
import { useQueryClient, useMutation, useQuery, UseMutationOptions } from '@tanstack/react-query';
import { TransactionDto } from './types';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    // list: (filters: string) => [...transactionsKeys.lists(), { filters }] as const,
    // details: () => [...transactionsKeys.all, 'detail'] as const,
    // detail: (id: number) => [...transactionsKeys.details(), id] as const,
};

const createTransaction = async (data: TransactionDto) => {
    console.log('createTransaction react query', data);
    const { error } = await supabase.from('transactions').insert(data);

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

export const useCreateTransaction = ({
    onSuccess,
    ...options
}: UseMutationOptions<unknown, Error, TransactionDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onError: (error) => {
            console.error('--> create transaction error', error);
            // I user optimistic update patter over here to update transactions list immediately after doing mutation
            // here in on error I want to revert adding new transaction to the list if there is an error
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
        ...options,
    });
};

export const useGetTransactions = () => {
    return useQuery({
        queryKey: transactionsKeys.lists(),
        queryFn: getTransactions,
    });
};
