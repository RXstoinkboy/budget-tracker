import { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { supabase } from '@auth';
import { Button, Input, Label, YStack } from 'tamagui';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';

// TODO: better to move whole this file to pages/auth.tsx instead of components

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

// TODO: it should handle prod vs dev automatically but it doesn't for some reason :(
const redirectTo = makeRedirectUri({
    scheme: __DEV__ ? 'exp' : 'com.budgettracker',
    // path: 'about',
});

const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    });
    if (error) throw error;
    return data.session;
};

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        // TODO: replace with Alert from TAMAGUI
        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: redirectTo,
            },
        });

        if (error) Alert.alert(error.message);
        if (!session)
            Alert.alert(
                'Please check your inbox for email verification!, your redirect link: ' +
                    redirectTo,
            );
        setLoading(false);
    }

    const url = Linking.useURL();
    if (url) createSessionFromUrl(url);

    useEffect(() => {
        // Handle deep linking
        const subscription = Linking.addEventListener('url', ({ url }) => {
            createSessionFromUrl(url);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <YStack width={200} minH={250} overflow="hidden" gap="$2" m="$3" p="$2">
            <YStack>
                <Label htmlFor="email">Name</Label>
                <Input
                    id="email"
                    placeholder="youremail@example.com"
                    value={email}
                    onChangeText={setEmail}
                />
            </YStack>

            <YStack>
                <Label htmlFor="password">Name</Label>
                <Input
                    id="password"
                    placeholder="your password"
                    value={password}
                    onChangeText={setPassword}
                />
            </YStack>

            <YStack>
                <Button onPress={() => signInWithEmail()} disabled={loading}>
                    Sign in
                </Button>
                <Button onPress={() => signUpWithEmail()} disabled={loading}>
                    Sign up
                </Button>
            </YStack>
        </YStack>
    );
}
