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

export const useGetTransactions = () => {
    return useQuery({
        queryKey: transactionsKeys.lists(),
        queryFn: getTransactions,
    });
};
