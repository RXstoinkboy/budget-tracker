import { Link, Stack } from 'expo-router';
import { View } from 'tamagui';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Ooops! Not found!' }} />
            <View>
                <Link href="/">Go back to Home screen!</Link>
            </View>
        </>
    );
}
