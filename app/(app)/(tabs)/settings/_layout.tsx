import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle: 'Settings' }} />
            <Stack.Screen
                name="profile"
                options={{ headerTitle: 'Profile', presentation: 'modal' }}
            />
            <Stack.Screen
                name="categories"
                options={{ headerTitle: 'Categories', presentation: 'modal' }}
            />
        </Stack>
    );
}
