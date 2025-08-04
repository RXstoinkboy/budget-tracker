import { useEffect } from 'react';
import { Linking, Text, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUpdateRequisitionStatus } from '@/features/integrations';
import { Spinner } from 'tamagui';

export default function Callback() {
    const router = useRouter();

    const onTryAgain = () => {
        router.replace('/(app)/(tabs)/accounts/add-account');
    };

    const returnToAccounts = () => {
        router.replace('/(app)/(tabs)/accounts');
    };

    const showAlert = () => {
        return Alert.alert('Unable to create connection', undefined, [
            {
                text: 'Try again',
                onPress: onTryAgain,
            },
            {
                text: 'Cancel',
                onPress: returnToAccounts,
            },
        ]);
    };

    const updateRequisitionStatus = useUpdateRequisitionStatus({
        onSuccess: () => {
            returnToAccounts();
        },
        onError: () => {
            returnToAccounts();
        },
    });

    const handleFinalizeAuth = async () => {
        const initialUrlString = await Linking.getInitialURL();

        if (!initialUrlString) {
            return showAlert();
        }

        const currentUrl = new URL(initialUrlString);
        const requisitionId = currentUrl.searchParams.get('ref');
        const error = currentUrl.searchParams.get('error');

        if (!requisitionId || error) {
            return showAlert();
        }

        updateRequisitionStatus.mutate({
            requisitionId,
            status: 'linked',
        });
    };

    useEffect(() => {
        handleFinalizeAuth();
    }, [router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Completing authentication...</Text>
            <Text style={{ textAlign: 'center', color: '#666', marginBottom: 10 }}>
                Please wait while we process your authentication.
            </Text>
            <Text style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
                You will be redirected automatically.
            </Text>
            <Spinner />
        </View>
    );
}
