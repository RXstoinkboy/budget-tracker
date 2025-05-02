import { useGetInstitutions } from '@/features/integrations/api/query';
import { YStack, H6, YGroup, Text, ScrollView, ListItem, XStack, Image, useTheme, getTokens } from 'tamagui';

const ConnectedAccounts = () => {
    return (
        <H6>No accounts connected yet</H6>
    );
};

const InstitutionsList = () => {
    // TODO: get country code from user (profile settings/ locale or something else)
    // TODO: there should also be the option to change country in search
    const { data: institutions, error } = useGetInstitutions('PL');

    if (error) {
        return <Text>Error loading institutions</Text>;
    }

    if (institutions?.length === 0) {
        return <Text>No institutions found</Text>;
    }

    return (
        <YGroup bordered size="$4">
            {institutions?.map((institution) => (
                <YGroup.Item key={institution.id}>
                    <ListItem
                    borderColor="$color4"
                    hoverStyle={{
                        bg: '$backgroundHover',
                        cursor: 'pointer',
                    }}
                    borderBottomWidth={1}
                    // opacity={isLoading ? 0.6 : 1}
                    // disabled={isLoading}``
                    >
                        <XStack items={'center'} gap="$2">
                            <Image source={{
                                uri: institution.logo,
                                width:getTokens().size.$2.val,
                                height: getTokens().size.$2.val
                            }} />
                            <Text>{institution.name}</Text>
                        </XStack>
                    </ListItem>
                </YGroup.Item>
            ))}
        </YGroup>
    )
}

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
