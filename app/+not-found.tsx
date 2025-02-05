import { router, Stack } from 'expo-router';
import { Button, YStack } from 'tamagui';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Ooops! Not found!' }} />
            <YStack flex={1} justify={'center'}>
                <Button onPress={() => router.replace('/')}>Go to main</Button>
            </YStack>
        </>
    );
}
