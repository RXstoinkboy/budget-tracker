import { useRouter } from 'expo-router';
import { Card, H6, ScrollView, Spinner, YStack, Text, Image, XStack } from 'tamagui';
import { Button } from '@/components/button';
import { CircleX, Plus, CheckCircle2 } from '@tamagui/lucide-icons';
import { AccountDto, useGetAccount, useGetAccounts } from '@/features/integrations';
import { getTokens } from '@tamagui/core';

const AccountCard = ({ account }: { account: AccountDto }) => {
    const getAccount = useGetAccount(account.id);

    return (
        <Card>
            {getAccount.isLoading ? (
                <Spinner />
            ) : (
                <>
                    <Card.Header>
                        <XStack gap="$2" items="center">
                            <Image
                                source={{
                                    uri: getAccount.data?.institution_logo,
                                    width: getTokens().size.$2.val,
                                    height: getTokens().size.$2.val,
                                }}
                            />
                            <Text>{getAccount.data?.institution_name}</Text>
                        </XStack>
                    </Card.Header>

                    <YStack gap="$2" px="$4" py="$2">
                        <XStack gap="$2" items="center">
                            <Text color="$color8" fontSize="$2">
                                Name:
                            </Text>
                            <Text>{getAccount.data?.name}</Text>
                        </XStack>
                        <XStack gap="$2" items="center">
                            <Text color="$color8" fontSize="$2">
                                IBAN:
                            </Text>
                            <Text>{getAccount.data?.iban}</Text>
                        </XStack>
                        <XStack gap="$2" items="center">
                            <Text color="$color8" fontSize="$2">
                                Owner name:
                            </Text>
                            <Text>{getAccount.data?.owner_name}</Text>
                        </XStack>

                        <XStack gap="$2" items="center">
                            <Text color="$color8" fontSize="$2">
                                Status:
                            </Text>
                            <Text>{getAccount.data?.status}</Text>
                            {getAccount.data?.status === 'READY' ? (
                                <CheckCircle2 color={'$green10'} />
                            ) : (
                                <CircleX color={'$red10'} />
                            )}
                        </XStack>
                    </YStack>
                </>
            )}

            <Card.Footer justify="flex-end" px="$4" pb="$4">
                <YStack items="flex-end">
                    <CircleX onPress={() => {}} />
                </YStack>
            </Card.Footer>
        </Card>
    );
};

export default function AccountsList() {
    const router = useRouter();
    const getAccounts = useGetAccounts();

    const addNewAccount = () => {
        router.push('/(app)/(tabs)/accounts/add-account');
    };

    if (getAccounts.isLoading) {
        return (
            <YStack content="center" flex={1}>
                <Spinner />
            </YStack>
        );
    }

    return (
        <YStack>
            <ScrollView>
                {getAccounts.data?.length === 0 ? (
                    <H6>No accounts connected yet</H6>
                ) : (
                    <YStack gap="$4" p="$4">
                        {getAccounts.data?.map((account) => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </YStack>
                )}
            </ScrollView>

            <Button disabled={getAccounts.isLoading} icon={Plus} onPress={addNewAccount}>
                Add new account
            </Button>
        </YStack>
    );
}
