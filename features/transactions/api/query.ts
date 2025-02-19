import {
    CreateTransactionDto,
    TransactionDto,
    TransactionFilters,
    TransactionsListResponse,
    UpdateTransactionDto,
} from '@/features/transactions/api/types';
import { supabase } from '@/utils/supabase';
import {
    useMutation,
    useQuery,
    UseMutationOptions,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    list: (filters: TransactionFilters) => [...transactionsKeys.lists(), { filters }] as const,
    create: () => [...transactionsKeys.all, 'create'] as const,
    updates: () => [...transactionsKeys.all, 'update'] as const,
    delete: () => [...transactionsKeys.all, 'delete'] as const,
    details: () => [...transactionsKeys.all, 'detail'] as const,
    detail: (id: string) => [...transactionsKeys.details(), id] as const,
};

const DEFAULT_FILTERS = { order_by_desc: true };

const createTransaction = async (data: CreateTransactionDto) => {
    const { data: response, error } = await supabase.from('transactions').insert(data).select('id');

    if (error) {
        throw error;
    }

    return {
        id: response?.[0].id,
    };
};

const updateTransaction = async ({ id, ...data }: UpdateTransactionDto) => {
    const { error } = await supabase.from('transactions').update(data).eq('id', id);

    if (error) {
        throw error;
    }
};

const deleteTransaction = async (id: TransactionDto['id']) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

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

const getTransactionDetails = async (id: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id);

    if (error) {
        throw error;
    }

    return data[0];
};

export const useCreateTransaction = (
    options: UseMutationOptions<unknown, Error, CreateTransactionDto>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
        onError: (error) => {
            console.error('--> create transaction error', error);
        },
        onSettled: () => {
            return queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
        mutationKey: transactionsKeys.create(),
        ...options,
    });
};

export const useUpdateTransaction = (
    options: UseMutationOptions<unknown, Error, UpdateTransactionDto>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateTransaction(data),
        onError: (error) => {
            console.error('--> update transaction error', error);
        },
        onSettled: (data, error, variables) => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: transactionsKeys.lists(),
                }),
                queryClient.invalidateQueries({
                    queryKey: transactionsKeys.detail(variables.id),
                }),
            ]);
        },
        mutationKey: transactionsKeys.updates(),
        ...options,
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, string>({
        mutationFn: deleteTransaction,
        onError: (error) => {
            console.error('--> delete transaction error', error);
        },
        onSettled: () => {
            return queryClient.invalidateQueries({
                queryKey: transactionsKeys.lists(),
            });
        },
        mutationKey: transactionsKeys.delete(),
    });
};

export const useGetTransactions = (filters: TransactionFilters = DEFAULT_FILTERS) => {
    return useQuery<TransactionFilters, Error, TransactionsListResponse>({
        queryKey: transactionsKeys.list(filters),
        queryFn: () => getTransactions(filters),
    });
};

export const useGetTransactionDetails = (
    id: string,
    options: Omit<UseQueryOptions<TransactionDto, Error, TransactionDto>, 'queryKey'> = {},
) => {
    // TODO: get initial data from the list to make the form more responsive
    return useQuery<TransactionDto, Error, TransactionDto>({
        queryKey: transactionsKeys.detail(id),
        queryFn: () => getTransactionDetails(id),
        ...options,
    });
};
