import { Button } from '@/components/button';
import { YStack, XStack, ScrollView, ListItem, H6, Text, Card } from 'tamagui';
import { router } from 'expo-router';
import { transactionsKeys, useGetTransactions } from '@/features/transactions/api/query';
import { useMutationState } from '@tanstack/react-query';
import {
    CreateTransactionDto,
    TransactionDto,
    UpdateTransactionDto,
} from '@/features/transactions/api/types';

type TransactionItemProps = {
    isGhost?: boolean;
    transaction: TransactionDto;
    onPress?: () => void;
};

const TransactionItem = ({ isGhost, transaction, onPress }: TransactionItemProps) => {
    const isLoading = Boolean(isGhost);
    return (
        // TODO: create new ListItem component to better handle all these 'disabled' states
        <ListItem opacity={isLoading ? 0.6 : 1} disabled={isLoading}>
            <XStack onPress={onPress} flex={1} justify="space-between">
                <Text>{transaction.name}</Text>
                <Text
                    color={
                        transaction.expense ? '$red10' : '$green10'
                    }>{`${transaction.expense ? '-' : '+'} ${transaction.amount}`}</Text>
            </XStack>
        </ListItem>
    );
};

export default function Tab() {
    const navigateToCreate = () => {
        router.push('/(app)/(tabs)/transactions/create');
    };
    const navigateToEdit = (id: string) => {
        router.push({
            pathname: '/(app)/(tabs)/transactions/[id]',
            params: {
                id,
            },
        });
    };
    const transactions = useGetTransactions();
    const newTransactions = useMutationState<CreateTransactionDto>({
        filters: { mutationKey: transactionsKeys.create(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CreateTransactionDto,
    });
    const updatedTransactions = useMutationState<TransactionDto>({
        filters: { mutationKey: transactionsKeys.updates(), status: 'pending' },
        select: (mutation) => mutation.state.variables as UpdateTransactionDto,
    });

    return (
        <YStack flex={1}>
            <ScrollView>
                {!transactions.data?.length && (
                    // TODO: better empty state page needed
                    <H6>No transactions yet. Add some manually or integrate your bank accout</H6>
                )}
                <YStack gap="$4">
                    {transactions.data?.map((dayTransactions) => (
                        <Card key={dayTransactions.transaction_date}>
                            <Card.Header borderBottomWidth={1} borderColor="$color4">
                                <Text>{dayTransactions.transaction_date}</Text>
                            </Card.Header>
                            {/* render newly added transactions for a psecific day */}
                            {newTransactions.map(
                                (transaction, index) =>
                                    dayTransactions.transaction_date ===
                                        transaction.transaction_date && (
                                        <TransactionItem
                                            isGhost
                                            key={index}
                                            transaction={{
                                                ...transaction,
                                                id: new Date().toString(),
                                            }}
                                        />
                                    ),
                            )}
                            {dayTransactions.transactions.map((transaction) => {
                                const updatedTransaction = updatedTransactions.find(
                                    (t) => t.id === transaction.id,
                                );
                                if (updatedTransaction) {
                                    return (
                                        <TransactionItem
                                            isGhost
                                            key={transaction.id}
                                            onPress={() => navigateToEdit(updatedTransaction.id)}
                                            transaction={updatedTransaction}
                                        />
                                    );
                                }
                                return (
                                    <TransactionItem
                                        key={transaction.id}
                                        transaction={transaction}
                                        onPress={() => navigateToEdit(transaction.id)}
                                    />
                                );
                            })}
                        </Card>
                    ))}
                </YStack>
            </ScrollView>
            {/* <Link
                action={{
                    type: 'push',
                }}
                href="/(tabs)/transactions/create">
                <Button>Create transaction</Button>
            </Link> */}
            <Button onPress={navigateToCreate}>Create transaction</Button>
        </YStack>
    );
}
