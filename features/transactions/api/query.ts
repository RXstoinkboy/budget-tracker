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
import { DateTime } from 'luxon';

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
    const startOfMonth = DateTime.now().startOf('month').toISODate();

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .filter('transaction_date', 'gte', startOfMonth)
        .order('transaction_date', {
            ascending: false,
        });

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

type GetTransactionsResponse = {
    raw: TransactionDto[];
    list: TransactionsListResponse;
};

const DEFAULT_FILTERS: TransactionFilters = {
    period: 'current_month',
};

const formatToList = (data: TransactionDto[]): TransactionsListResponse => {
    return data.reduce((acc, transaction) => {
        const date = transaction.transaction_date;
        const daySlot = acc.find((day) => day.transaction_date === date);

        if (daySlot) {
            daySlot.transactions.push(transaction);
            return acc;
        }

        acc.push({
            transaction_date: date,
            transactions: [transaction],
        });

        return acc;
    }, [] as TransactionsListResponse);
};

export const useGetTransactions = (filters: TransactionFilters = DEFAULT_FILTERS) => {
    return useQuery<TransactionDto[], Error, GetTransactionsResponse>({
        queryKey: transactionsKeys.list(filters),
        queryFn: () => getTransactions(filters),
        select: (data) => ({
            raw: data,
            list: formatToList(data),
        }),
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
