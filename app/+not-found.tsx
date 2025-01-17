import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

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
