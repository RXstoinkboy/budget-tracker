import {
    TransactionDto,
    TransactionFilters,
    TransactionListResponse,
} from '@/features/transactions/api/types';
import { supabase } from '@/utils/supabase';
import { useQueryClient, useMutation, useQuery, UseMutationOptions } from '@tanstack/react-query';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    list: (filters: TransactionFilters) => [...transactionsKeys.lists(), { filters }] as const,
    // details: () => [...transactionsKeys.all, 'detail'] as const,
    // detail: (id: number) => [...transactionsKeys.details(), id] as const,
};

const createTransaction = async (data: TransactionDto) => {
    const { error } = await supabase.from('transactions').insert(data);

    if (error) {
        throw error;
    }
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
    onMutate,
    ...options
}: UseMutationOptions<unknown, Error, TransactionDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onMutate: async (newTransaction) => {
            await queryClient.cancelQueries({
                queryKey: transactionsKeys.lists(),
            });
            const previousSnapshot = queryClient.getQueryData(transactionsKeys.lists());

            queryClient.setQueryData<TransactionDto[]>(transactionsKeys.lists(), (oldData) => {
                return [newTransaction, ...oldData];
            });

            onMutate?.(newTransaction);
            return { previousSnapshot };
        },
        onError: (error, newTransaction, context: { previousSnapshot: TransactionDto[] }) => {
            console.error('--> create transaction error', error);
            queryClient.setQueryData(transactionsKeys.lists(), context?.previousSnapshot);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
        ...options,
    });
};

export const useGetTransactions = (filters: TransactionFilters = { order_by_desc: true }) => {
    return useQuery<TransactionFilters, Error, TransactionListResponse>({
        queryKey: transactionsKeys.list(filters),
        queryFn: () => getTransactions(filters),
    });
};
