import { useSignInWithEmail, useSignUpWithEmail } from '@/auth/mutation';
import { useAuthSession } from '@/auth/query';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Button, Input, Label, XStack, YStack } from 'tamagui';

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
                gap="$2"
                justify={'center'}
                p="$2">
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

                <XStack justify={'center'}>
                    <YStack gap={'$2'} width={200}>
                        <Button
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
                </XStack>
            </YStack>
        </>
    );
}
