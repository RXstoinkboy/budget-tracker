import { useRouter } from 'expo-router';
import { H6, ScrollView } from 'tamagui';
import { Button } from '@/components/button';
import { Plus } from '@tamagui/lucide-icons';

export default function Tab() {
    const router = useRouter();

    const addNewAccount = () => {
        router.push('/(app)/(tabs)/accounts/add-account');
    };

    return (
        <ScrollView>
            <H6>No accounts connected yet</H6>
            <Button icon={Plus} onPress={addNewAccount}>
                Add new account
            </Button>
        </ScrollView>
    );
}
