import { Button } from '@/components/button';
import { useSignOut } from '@/features/auth/mutation';
import { ChevronRight, User, ListTree } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { ListItem, Spinner, Text, YGroup, YStack } from 'tamagui';

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
            <Link href="/(app)/(tabs)/settings/categories">
                <Text>Categories</Text>
            </Link>
            <YGroup bordered size="$4">
                <YGroup.Item>
                    <Link asChild href="/(app)/(tabs)/settings/profile">
                        <ListItem
                            hoverTheme
                            pressTheme
                            icon={<User />}
                            iconAfter={<ChevronRight />}>
                            Profile
                        </ListItem>
                    </Link>
                </YGroup.Item>
                <YGroup.Item>
                    <Link asChild href="/(app)/(tabs)/settings/categories">
                        <ListItem
                            hoverTheme
                            pressTheme
                            icon={<ListTree />}
                            iconAfter={<ChevronRight />}>
                            Categories
                        </ListItem>
                    </Link>
                </YGroup.Item>
            </YGroup>
            <Button
                disabled={signOut.isPending}
                icon={signOut.isPending ? <Spinner /> : undefined}
                onPress={handlePress}>
                Sign out
            </Button>
        </YStack>
    );
}
