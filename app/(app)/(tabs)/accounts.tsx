import { Image, ListItem, YGroup, YStack } from 'tamagui';
import { Button } from '@/components/button';
import { Linking } from 'react-native';
import { supabase } from '@/utils/supabase';

// TODO: just some mock data - replace with query
// actually I don't even save connected accounts anywhere in db
// I should do it so when they are connected then I can show them here and easily fetch data for them
const accounts = [
    // {
    //     id: '1',
    //     name: 'Bank of America',
    //     balance: 1000,
    //     currency: 'USD',
    //     type: 'checking',
    //     iconUrl: ''https://picsum.photos/200/300'',
    // },
];

// this might be changed in the future. It is just an initial DTO proposition
type AccountDto = {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
    iconUrl: string;
};

const ConnectAccountButton = () => {
    const handleConnectAccount = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('bank_integration', {
                body: { action: 'initiate_connection' },
            });

            if (error) {
                console.error('Error initiating bank connection:', error);
                return;
            }

            // Open the redirect URL in the device's browser
            if (data?.redirectUrl) {
                await Linking.openURL(data.redirectUrl);
            }
        } catch (error) {
            console.error('Failed to connect account:', error);
        }
    };

    if (accounts.length === 0) {
        return <Button onPress={handleConnectAccount}>Connect first account</Button>;
    }
    return <Button onPress={handleConnectAccount}>Connect another account</Button>;
};

type ConnectedAccountProps = {
    account: AccountDto;
};

const ConnectedAccount = ({ account }: ConnectedAccountProps) => {
    const onAccountPress = () => {
        console.log('account pressed');
    };
    return (
        <YGroup.Item>
            <ListItem
                hoverTheme
                pressTheme
                title={account.name}
                onPress={onAccountPress}
                subTitle={account.type}
                icon={
                    <Image
                        source={{
                            uri: 'https://picsum.photos/200/300',
                            width: 80,
                            height: 80,
                        }}
                    />
                }
            />
        </YGroup.Item>
    );
};

const ConnectedAccounts = () => {
    return (
        <YGroup rounded={'$radius.4'} bordered>
            {accounts.map((account) => (
                <ConnectedAccount account={account} />
            ))}
        </YGroup>
    );
};

export default function Tab() {
    return (
        <YStack>
            <ConnectAccountButton />
            <ConnectedAccounts />
        </YStack>
    );
}
