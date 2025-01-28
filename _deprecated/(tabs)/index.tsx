import { View, Text } from 'tamagui';
import { Link } from 'expo-router';

export default function Index() {
    return (
        <View bg={'$background'}>
            <Text>hello from budget app main page! Now the fun begins</Text>
            <Link href={'/sign-in'}>Auth</Link>
        </View>
    );
}
