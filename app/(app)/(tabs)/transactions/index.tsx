import { Button } from '@/components/button';
import { YStack, XStack, ScrollView, ListItem, H4, H6, Text, Card } from 'tamagui';
import { router } from 'expo-router';
import { useGetTransactions } from '@/features/transactions/api/query';

export default function Tab() {
    const onCreateTransaction = () => {
        router.push('/(app)/(tabs)/transactions/create');
    };
    const transactions = useGetTransactions();

    return (
        <YStack flex={1}>
            <H4>Tab transactions</H4>
            <ScrollView>
                {!transactions.data?.length && (
                    <H6>No transactions yet. Add some manually or integrate your bank accout</H6>
                )}
                <YStack gap="$4">
                    {transactions.data?.map((dayTransactions) => (
                        <Card key={dayTransactions.transaction_date}>
                            <Card.Header>
                                <Text>{dayTransactions.transaction_date}</Text>
                            </Card.Header>
                            {dayTransactions.transactions.map((transaction) => (
                                <ListItem key={transaction.id}>
                                    <XStack flex={1} justify="space-between">
                                        <Text>{transaction.name}</Text>
                                        <Text
                                            color={
                                                transaction.expense ? '$red10' : '$green10'
                                            }>{`${transaction.expense ? '-' : '+'} ${transaction.amount}`}</Text>
                                    </XStack>
                                </ListItem>
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
