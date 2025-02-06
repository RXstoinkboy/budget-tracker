import { Button } from '@/components/button';
import { Text, YStack, ScrollView, ListItem, H4, H6 } from 'tamagui';
import { router } from 'expo-router';
import { useGetTransactions } from '@/features/transactions/api/query';

export default function Tab() {
    const onCreateTransaction = () => {
        // createTransaction.mutate();
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
                {transactions.data?.map((transaction) => (
                    <ListItem key={transaction.id}>
                        <Text>{transaction.name}</Text>
                    </ListItem>
                ))}
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
