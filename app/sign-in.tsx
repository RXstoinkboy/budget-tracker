import { useState } from 'react';
import { useSignInWithEmail, useSignUpWithEmail } from '@/features/auth/mutation';
import { useAuthSession } from '@/features/auth/query';
import { Redirect } from 'expo-router';
import { H2, Input, Label, Spinner, XStack, YStack } from 'tamagui';
import { Button } from '@/components/button';

export default function SignIn() {
    const [email, setEmail] = useState('erykludwin@gmail.com');
    const [password, setPassword] = useState('Test123');

    const signInWithEmail = useSignInWithEmail();
    const signUpWithEmail = useSignUpWithEmail();
    const authSession = useAuthSession();

    return (
        <>
            {authSession.data?.session && <Redirect href="/" />}

            <YStack
                bg={'$background'}
                fullscreen
                overflow="hidden"
                gap="$5"
                justify={'center'}
                p="$4">
                <YStack gap={'$2'}>
                    <H2 mb={'$4'} fontWeight={900}>
                        Hello!
                    </H2>
                    <XStack>
                        <Label width={100} gap={'$4'} htmlFor="email">
                            Email
                        </Label>
                        <Input
                            flex={1}
                            id="email"
                            textContentType="emailAddress"
                            keyboardType="email-address"
                            placeholder="youremail@example.com"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </XStack>

                    <XStack>
                        <Label width={100} gap={'$4'} htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            textContentType="password"
                            secureTextEntry
                            flex={1}
                            placeholder="your password"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </XStack>
                </YStack>

                <YStack gap={'$2'}>
                    <Button
                        primary
                        animation={'bouncy'}
                        icon={signInWithEmail.isPending ? <Spinner /> : undefined}
                        onPress={() =>
                            signInWithEmail.mutate({
                                email,
                                password,
                            })
                        }
                        disabled={signInWithEmail.isPending}>
                        Sign in
                    </Button>
                    <Button
                        chromeless
                        onPress={() =>
                            signUpWithEmail.mutate({
                                email,
                                password,
                            })
                        }
                        disabled={signUpWithEmail.isPending}>
                        Sign up
                    </Button>
                </YStack>
            </YStack>
        </>
    );
}
