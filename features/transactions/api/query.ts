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
    // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    // await delay(3000);

    // return [
    //     {
    //         id: '1',
    //         name: 'Transaction 1',
    //         amount: 100,
    //         description: null,
    //         transaction_date: '2025-02-01',
    //         receipt_url: null,
    //         expense: true,
    //         category_id: null,
    //     },
    //     {
    //         id: '2',
    //         name: 'Transaction 2',
    //         amount: 200,
    //         description: null,
    //         transaction_date: '2025-02-02',
    //         receipt_url: null,
    //         expense: true,
    //         category_id: null,
    //     },
    //     {
    //         id: '3',
    //         name: 'Transaction 3',
    //         amount: 300,
    //         description: null,
    //         transaction_date: '2025-02-03',
    //         receipt_url: null,
    //         expense: true,
    //         category_id: null,
    //     },
    // ];
};

const getTransactionDetails = async (id: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id);

    if (error) {
        throw error;
    }

    return data[0];
};

export const useCreateTransaction = ({
    onMutate,
    onError,
    ...options
}: UseMutationOptions<unknown, Error, CreateTransactionDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        // TODO: use dynamic filters here later on instead of hard coced default values
        mutationFn: createTransaction,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({
                queryKey: transactionsKeys.list(DEFAULT_FILTERS),
            });
            const previousTransactions = queryClient.getQueryData<TransactionDto[]>(
                transactionsKeys.list(DEFAULT_FILTERS),
            );

            // Find the correct position to insert the new transaction
            const insertIndex =
                previousTransactions?.findIndex(
                    (transaction) =>
                        DateTime.fromISO(transaction.transaction_date) <
                        DateTime.fromISO(variables.transaction_date),
                ) ?? 0;

            // Create new array with the transaction inserted at the correct position
            const updatedTransactions = [
                ...(previousTransactions?.slice(0, insertIndex) ?? []),
                variables,
                ...(previousTransactions?.slice(insertIndex) ?? []),
            ];

            queryClient.setQueryData(transactionsKeys.list(DEFAULT_FILTERS), updatedTransactions);

            onMutate?.(variables);
            return { previousTransactions };
        },
        onError: (err, data, context: { previousTransactions?: TransactionDto[] }) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );

            console.error('--> create transaction error', err);

            onError?.(err, data, context);
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

export const useUpdateTransaction = ({
    onMutate,
    onError,
    ...options
}: UseMutationOptions<unknown, Error, UpdateTransactionDto>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateTransaction(data),
        onMutate: async (variables) => {
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.list(DEFAULT_FILTERS),
                }),
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.detail(variables.id),
                }),
            ]);
            const previousTransactions = queryClient.getQueryData<TransactionDto[]>(
                transactionsKeys.list(DEFAULT_FILTERS),
            );

            const updatedTransactions = previousTransactions?.map((transaction) => {
                if (transaction.id === variables.id) {
                    return variables;
                }
                return transaction;
            });

            queryClient.setQueryData(transactionsKeys.list(DEFAULT_FILTERS), updatedTransactions);
            onMutate?.(variables);

            return { previousTransactions };
        },
        onError: (error, data, context: { previousTransactions?: TransactionDto[] }) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );

            onError?.(error, data, context);

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
        onMutate: async (id) => {
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.list(DEFAULT_FILTERS),
                }),
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.detail(id),
                }),
            ]);
            const previousTransactions = queryClient.getQueryData<TransactionDto[]>(
                transactionsKeys.list(DEFAULT_FILTERS),
            );

            const updatedTransactions = previousTransactions?.filter(
                (transaction) => transaction.id !== id,
            );

            queryClient.setQueryData(transactionsKeys.list(DEFAULT_FILTERS), updatedTransactions);

            return { previousTransactions };
        },
        onError: (error, data, context: { previousTransactions?: TransactionDto[] }) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );
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
