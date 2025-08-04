import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle: 'Accounts' }} />
            <Stack.Screen
                name="add-account"
                options={{ headerTitle: 'Add account', presentation: 'modal' }}
            />
            <Stack.Screen name="callback" options={{ headerShown: false }} />
        </Stack>
    );
}
