import { Link } from 'expo-router';
import { Text, YStack } from 'tamagui';

export default function Profile() {
    return (
        <YStack gap="$4">
            <Text>This might be profile picture</Text>
            <Text>This is some options</Text>
            <Link href="/(app)/(tabs)/settings/profile">
                <Text>Profile</Text>
            </Link>
        </YStack>
    );
}
