import { BudgetFilters, TransactionSummary } from '@/features/budget/api/types';
import { DEFAULT_FILTERS as BUDGET_DEFAULT_FILTERS } from '@/features/budget/api/query';
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
    QueryClient,
} from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useGetCategories } from '@/features/categories/api/query';

export const transactionsKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionsKeys.all, 'list'] as const,
    list: (filters: TransactionFilters) => [...transactionsKeys.lists(), { filters }] as const,
    listSummary: (filters: BudgetFilters) =>
        [...transactionsKeys.lists(), 'summary', { filters }] as const,
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
    const endOfMonth = DateTime.now().endOf('month').toISODate();

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .filter('transaction_date', 'gte', startOfMonth)
        .filter('transaction_date', 'lte', endOfMonth)
        .order('transaction_date', {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data;
};

const getTransactionsSummary = async (filters: BudgetFilters) => {
    const startOfMonth = DateTime.now().startOf('month').toISODate();
    const endOfMonth = DateTime.now().endOf('month').toISODate();

    const { data, error } = await supabase.rpc('get_transaction_sums_by_category', {
        start_date: startOfMonth,
        end_date: endOfMonth,
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

const updateTransactionsOnCreate = (
    variables: CreateTransactionDto,
    queryClient: QueryClient,
): {
    previousTransactions?: TransactionDto[];
} => {
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
    const newTransaction = {
        ...variables,
        id: new Date().toString(),
    };

    // Create new array with the transaction inserted at the correct position
    const updatedTransactions = [
        ...(previousTransactions?.slice(0, insertIndex) ?? []),
        newTransaction,
        ...(previousTransactions?.slice(insertIndex) ?? []),
    ];

    queryClient.setQueryData(transactionsKeys.list(DEFAULT_FILTERS), updatedTransactions);

    return { previousTransactions };
};

const updateTransactionsSummaryOnCreate = (
    transaction: CreateTransactionDto,
    queryClient: QueryClient,
) => {
    const previousSummary = queryClient.getQueryData<TransactionSummary[]>(
        transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
    );

    const updatedSummary = previousSummary?.map((summary) => {
        if (summary.category_id === transaction?.category_id) {
            return {
                ...summary,
                total_amount: summary.total_amount + transaction.amount,
            };
        }
        return summary;
    });

    queryClient.setQueryData(transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS), updatedSummary);

    return { previousSummary };
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
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.list(DEFAULT_FILTERS),
                }),
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                }),
            ]);
            const { previousTransactions } = updateTransactionsOnCreate(variables, queryClient);
            const { previousSummary } = updateTransactionsSummaryOnCreate(variables, queryClient);

            onMutate?.(variables);
            return { previousTransactions, previousSummary };
        },
        onError: (
            err,
            data,
            context: {
                previousTransactions?: TransactionDto[];
                previousSummary?: TransactionSummary[];
            },
        ) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );
            queryClient.setQueryData(
                transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                context?.previousSummary,
            );

            console.error('--> create transaction error', err);

            onError?.(err, data, context);
        },
        onSettled: () => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: transactionsKeys.lists(),
                }),
                queryClient.invalidateQueries({
                    queryKey: transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                }),
            ]);
        },
        mutationKey: transactionsKeys.create(),
        ...options,
    });
};

const updateTransactionsOnUpdate = (
    variables: UpdateTransactionDto,
    queryClient: QueryClient,
): {
    previousTransactions?: TransactionDto[];
} => {
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
    return { previousTransactions };
};

const updateTransactionsSummaryOnUpdate = (
    variables: UpdateTransactionDto,
    previousTransaction: TransactionDto | undefined,
    queryClient: QueryClient,
) => {
    const previousSummary = queryClient.getQueryData<TransactionSummary[]>(
        transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
    );
    if (!previousTransaction) {
        return { previousSummary };
    }

    const diff = previousTransaction.amount - variables.amount;

    if (diff === 0) {
        return { previousSummary };
    }

    const updatedSummary = previousSummary?.map((summary) => {
        if (summary.category_id === variables.category_id) {
            return {
                ...summary,
                total_amount: summary.total_amount + diff,
            };
        }
        return summary;
    });

    queryClient.setQueryData(transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS), updatedSummary);

    return { previousSummary };
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
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                }),
            ]);

            const { previousTransactions } = updateTransactionsOnUpdate(variables, queryClient);
            const previousTransaction = previousTransactions?.find(
                (transaction) => transaction.id === variables.id,
            );
            const { previousSummary } = updateTransactionsSummaryOnUpdate(
                variables,
                previousTransaction,
                queryClient,
            );

            onMutate?.(variables);

            return { previousTransactions, previousSummary };
        },
        onError: (
            error,
            data,
            context: {
                previousTransactions?: TransactionDto[];
                previousSummary?: TransactionSummary[];
            },
        ) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );
            queryClient.setQueryData(
                transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                context?.previousSummary,
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

const updateTransactionsOnDelete = (
    id: string,
    queryClient: QueryClient,
): {
    previousTransactions: TransactionDto[];
} => {
    const previousTransactions =
        queryClient.getQueryData<TransactionDto[]>(transactionsKeys.list(DEFAULT_FILTERS)) ?? [];

    const updatedTransactions = previousTransactions?.filter(
        (transaction) => transaction.id !== id,
    );

    queryClient.setQueryData(transactionsKeys.list(DEFAULT_FILTERS), updatedTransactions);

    return { previousTransactions };
};

const updateTransactionsSummaryOnDelete = (
    queryClient: QueryClient,
    transaction?: TransactionDto,
) => {
    const previousSummary = queryClient.getQueryData<TransactionSummary[]>(
        transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
    );

    const updatedSummary = previousSummary?.map((summary) => {
        if (summary.category_id === transaction?.category_id) {
            return {
                ...summary,
                total_amount: summary.total_amount - transaction.amount,
            };
        }
        return summary;
    });

    queryClient.setQueryData(transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS), updatedSummary);

    return { previousSummary };
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
                queryClient.cancelQueries({
                    queryKey: transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                }),
            ]);
            const { previousTransactions } = updateTransactionsOnDelete(id, queryClient);
            const prevTransaction = previousTransactions?.find(
                (transaction) => transaction.id === id,
            );
            const { previousSummary } = updateTransactionsSummaryOnDelete(
                queryClient,
                prevTransaction,
            );

            return { previousTransactions, previousSummary };
        },
        onError: (
            error,
            data,
            context: {
                previousTransactions?: TransactionDto[];
                previousSummary?: TransactionSummary[];
            },
        ) => {
            queryClient.setQueryData(
                transactionsKeys.list(DEFAULT_FILTERS),
                context?.previousTransactions,
            );
            queryClient.setQueryData(
                transactionsKeys.listSummary(BUDGET_DEFAULT_FILTERS),
                context?.previousSummary,
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

export const useGetTransactionsSummary = (filters: BudgetFilters = BUDGET_DEFAULT_FILTERS) => {
    const { data: categories } = useGetCategories();

    return useQuery<TransactionSummary[], Error, TransactionSummary[]>({
        queryKey: transactionsKeys.listSummary(filters),
        queryFn: () => getTransactionsSummary(filters),
        select: (rawData) =>
            rawData.map((summary) => {
                const { name, icon, icon_color } =
                    categories?.list.find((cat) => cat.id === summary.category_id) ?? {};
                return {
                    ...summary,
                    name,
                    icon,
                    icon_color,
                };
            }),
    });
};

export const useGetTransactionDetails = (
    id: string,
    options: Omit<UseQueryOptions<TransactionDto, Error, TransactionDto>, 'queryKey'> = {},
) => {
    const queryClient = useQueryClient();

    return useQuery<TransactionDto, Error, TransactionDto>({
        queryKey: transactionsKeys.detail(id),
        queryFn: () => getTransactionDetails(id),
        initialData: () => {
            const transactions = queryClient.getQueryData<TransactionDto[]>(
                transactionsKeys.list(DEFAULT_FILTERS),
            );
            return transactions?.find((transaction) => transaction.id === id);
        },
        ...options,
    });
};
