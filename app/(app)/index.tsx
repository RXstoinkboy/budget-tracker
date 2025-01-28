import { useSignOut } from '@/auth/mutation';
import { Button, Text, View } from 'tamagui';

export default function Index() {
    const signOut = useSignOut();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Sign out page</Text>
            <Button
                onPress={() => {
                    signOut.mutate();
                }}>
                Sign Out
            </Button>
        </View>
    );
}
