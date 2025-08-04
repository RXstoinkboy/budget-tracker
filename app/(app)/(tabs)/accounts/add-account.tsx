import { useGetInstitutions, useLinkWithInstitution } from '@/features/integrations';
import { makeRedirectUri } from 'expo-auth-session';
import { Link } from 'expo-router';
import {
    coolDownAsync,
    openBrowserAsync,
    warmUpAsync,
    WebBrowserPresentationStyle,
} from 'expo-web-browser';
import { useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { YGroup, ListItem, XStack, getTokens, Text, Image, Spinner, YStack } from 'tamagui';

export default function InstitutionsList() {
    const redirectUrl = makeRedirectUri({
        scheme: 'budgettracker',
        path: 'accounts/callback',
    });

    // TODO: get country code from user (profile settings/ locale or something else)
    // TODO: there should also be the option to change country in search
    const { data: institutions, isError, error, isLoading } = useGetInstitutions('PL');

    const linkWithInstitution = useLinkWithInstitution({
        async onSuccess(data) {
            try {
                if (Platform.OS === 'web') {
                    window.location.href = data.link;
                } else {
                    await openBrowserAsync(data.link, {
                        presentationStyle: WebBrowserPresentationStyle.FULL_SCREEN,
                    });
                }
            } catch (error) {
                console.error('Native browser opening error:', error);
            }
        },
    });

    const connectToInstitution = (institutionId: string) => {
        linkWithInstitution.mutate({
            institutionId,
            redirectUrl,
        });
    };

    useEffect(() => {
        if (Platform.OS !== 'web') {
            warmUpAsync();
        }

        return () => {
            if (Platform.OS !== 'web') {
                coolDownAsync();
            }
        };
    }, []);

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
        <ScrollView>
            {linkWithInstitution.isPending ? (
                <YGroup items={'center'}>
                    <Text style={{ fontSize: 18, marginBottom: 10 }}>
                        Redirecting to authentication page...
                    </Text>
                    <Spinner />
                </YGroup>
            ) : (
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
                            onPress={() => connectToInstitution('SANDBOXFINANCE_SFIN0000')}>
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
                                onPress={() => connectToInstitution(institution.id)}>
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
            )}
        </ScrollView>
    );
}
