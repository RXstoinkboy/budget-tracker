import {
    CreateTransactionDto,
    TransactionFilters,
    TransactionsListResponse,
} from '@/features/transactions/api/types';
import { supabase } from '@/utils/supabase';
import { useMutation, useQuery, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    list: (filters: TransactionFilters) => [...transactionsKeys.lists(), { filters }] as const,
    create: () => [...transactionsKeys.lists(), 'create'] as const,
    // details: () => [...transactionsKeys.all, 'detail'] as const,
    // detail: (id: number) => [...transactionsKeys.details(), id] as const,
};

const createTransaction = async (data: CreateTransactionDto) => {
    const { data: response, error } = await supabase.from('transactions').insert(data).select('id');

    if (error) {
        throw error;
    }

    return {
        id: response?.[0].id,
    };
};

const getTransactions = async (filters: TransactionFilters) => {
    const { data, error } = await supabase.rpc('get_transactions_grouped_by_date', filters);

    if (error) {
        throw error;
    }

    return data;
};

export const useCreateTransaction = ({
    onSuccess,
    ...options
}: UseMutationOptions<unknown, Error, CreateTransactionDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onError: (error) => {
            console.error('--> create transaction error', error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
        mutationKey: transactionsKeys.create(),
        ...options,
    });
};

export const useGetTransactions = (filters: TransactionFilters = { order_by_desc: true }) => {
    return useQuery<TransactionFilters, Error, TransactionsListResponse>({
        queryKey: transactionsKeys.list(filters),
        queryFn: () => getTransactions(filters),
    });
};
