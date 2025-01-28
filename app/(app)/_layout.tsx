import { H3, Text, View, XStack, YStack } from 'tamagui';
import { Redirect, Stack } from 'expo-router';
import { useAuthSession } from '@/auth/query';

export default function AppLayout() {
    const authSession = useAuthSession();

    // You can keep the splash screen open, or render a loading screen like we do here.
    if (authSession.isLoading) {
        return (
            <YStack fullscreen bg={'$background'} justify={'center'}>
                <XStack justify={'center'}>
                    <H3>Loading...</H3>
                </XStack>
            </YStack>
        );
    }

    // Only require authentication within the (app) group's layout as users
    // need to be able to access the (auth) group and sign in again.
    if (!authSession.data?.session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return (
            <View>
                <Text>Redirect</Text>
                <Redirect href="/sign-in" />
            </View>
        );
    }

    // This layout can be deferred because it's not the root layout.
    return <Stack />;
}
