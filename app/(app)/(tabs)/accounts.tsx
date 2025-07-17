import {
    useGetInstitutions,
    useLinkWithInstitution,
    useUpdateRequisitionStatus,
} from '@/features/integrations/api/query';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { YStack, H6, YGroup, Text, ScrollView, ListItem, XStack, Image, getTokens } from 'tamagui';

export function useGetRequisitionDataFromUrl() {
    const updateRequisitionStatus = useUpdateRequisitionStatus();

    useEffect(() => {
        // Handle deep linking
        const subscription = Linking.addEventListener('url', ({ url }) => {
            console.log('=======>>>> url', url);
            const urlParams = new URLSearchParams(url);
            const requisitionId = urlParams.get('ref');
            const error = urlParams.get('error');
            const details = urlParams.get('details');

            if (error) {
                console.log('Error redirecting from URL', error, details);
                return;
            }

            updateRequisitionStatus.mutate(
                {
                    requisitionId: requisitionId || '',
                    status: error ? 'error' : 'linked',
                },
                {
                    onSuccess: () => {
                        console.log('Requisition status updated');
                    },
                },
            );
        });

        return () => {
            subscription.remove();
        };
    }, []);
}

const ConnectedAccounts = () => {
    return <H6>No accounts connected yet</H6>;
};

const InstitutionsList = () => {
    // TODO: get country code from user (profile settings/ locale or something else)
    // TODO: there should also be the option to change country in search
    const { data: institutions, isError, error, isLoading } = useGetInstitutions('PL');
    const linkWithInstitution = useLinkWithInstitution({
        onSuccess(data) {
            console.log('useLinkWithInstitution data', data);
            Linking.openURL(data.link);
        },
    });
    useGetRequisitionDataFromUrl();

    const connectToInstitution = (institutionId: string) => {
        linkWithInstitution.mutate({
            institutionId,
            redirectUrl: 'budgettracker://accounts',
        });
    };

    if (isError) {
        return <Text>Error loading institutions {error.message}</Text>;
    }

    if (institutions?.length === 0) {
        return <Text>No institutions found</Text>;
    }

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <YGroup bordered size="$4">
            <YGroup.Item key="mocked-institution">
                <ListItem
                    borderColor="$color4"
                    hoverStyle={{
                        bg: '$backgroundHover',
                        cursor: 'pointer',
                    }}
                    borderBottomWidth={1}
                    pressStyle={{
                        bg: '$backgroundPress',
                        cursor: 'pointer',
                    }}
                    onPress={() => connectToInstitution('SANDBOXFINANCE_SFIN0000')}
                    // opacity={isLoading ? 0.6 : 1}
                    // disabled={isLoading}``
                >
                    <XStack items={'center'} gap="$2">
                        <Image
                            source={{
                                uri: 'https://www.sandboxfinance.com/wp-content/uploads/2018/03/sandbox-finance-logo-1.png',
                                width: getTokens().size.$2.val,
                                height: getTokens().size.$2.val,
                            }}
                        />
                        <Text>Mocked Institution</Text>
                    </XStack>
                </ListItem>
            </YGroup.Item>

            {institutions?.map((institution) => (
                <YGroup.Item key={institution.id}>
                    <ListItem
                        borderColor="$color4"
                        hoverStyle={{
                            bg: '$backgroundHover',
                            cursor: 'pointer',
                        }}
                        borderBottomWidth={1}
                        pressStyle={{
                            bg: '$backgroundPress',
                            cursor: 'pointer',
                        }}
                        onPress={() => connectToInstitution(institution.id)}
                        // opacity={isLoading ? 0.6 : 1}
                        // disabled={isLoading}``
                    >
                        <XStack items={'center'} gap="$2">
                            <Image
                                source={{
                                    uri: institution.logo,
                                    width: getTokens().size.$2.val,
                                    height: getTokens().size.$2.val,
                                }}
                            />
                            <Text>{institution.name}</Text>
                        </XStack>
                    </ListItem>
                </YGroup.Item>
            ))}
        </YGroup>
    );
};

export default function Tab() {
    return (
        <ScrollView>
            <YStack>
                <ConnectedAccounts />
                <InstitutionsList />
            </YStack>
        </ScrollView>
    );
}
