import { Button } from '@/components/button';
import { useSignOut } from '@/features/auth/mutation';
import { Link } from 'expo-router';
import { Spinner, Text, YStack } from 'tamagui';

export default function Profile() {
    const signOut = useSignOut();
    const handlePress = () => {
        return signOut.mutate();
    };

    return (
        <YStack gap="$4">
            <Text>This might be profile picture</Text>
            <Text>This is some options</Text>
            <Link href="/(app)/(tabs)/settings/profile">
                <Text>Profile</Text>
            </Link>
            <Button
                disabled={signOut.isPending}
                icon={signOut.isPending ? <Spinner /> : undefined}
                onPress={handlePress}>
                Sign out
            </Button>
        </YStack>
    );
}
