import { Button } from '@/components/button';
import { YStack, XStack, ScrollView, ListItem, H6, Text, Card } from 'tamagui';
import { router } from 'expo-router';
import { transactionsKeys, useGetTransactions } from '@/features/transactions/api/query';
import { useMutationState } from '@tanstack/react-query';
import { CreateTransactionDto } from '@/features/transactions/api/types';

const TransactionItem = (props: CreateTransactionDto) => {
    return (
        <ListItem>
            <XStack flex={1} justify="space-between">
                <Text>{props.name}</Text>
                <Text
                    color={
                        props.expense ? '$red10' : '$green10'
                    }>{`${props.expense ? '-' : '+'} ${props.amount}`}</Text>
            </XStack>
        </ListItem>
    );
};

export default function Tab() {
    const onCreateTransaction = () => {
        router.push('/(app)/(tabs)/transactions/create');
    };
    const transactions = useGetTransactions();
    const newTransaction = useMutationState<CreateTransactionDto>({
        filters: { mutationKey: transactionsKeys.create(), status: 'pending' },
        select: (mutation) => mutation.state.variables as CreateTransactionDto,
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
                            <Card.Header>
                                <Text>{dayTransactions.transaction_date}</Text>
                            </Card.Header>
                            {newTransaction.map(
                                (transaction, index) =>
                                    dayTransactions.transaction_date ===
                                        transaction.transaction_date && (
                                        <TransactionItem key={index} {...transaction} />
                                    ),
                            )}
                            {dayTransactions.transactions.map((transaction) => (
                                <TransactionItem key={transaction.id} {...transaction} />
                            ))}
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
            <Button onPress={onCreateTransaction}>Create transaction</Button>
        </YStack>
    );
}
