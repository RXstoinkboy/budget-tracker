import { Stack } from 'expo-router';

export default function TransactionsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerTitle: 'Transactions',
                }}
            />
            <Stack.Screen
                name="create"
                options={{
                    presentation: 'modal',
                    headerTitle: 'Add transaction',
                }}
            />
        </Stack>
    );
}
