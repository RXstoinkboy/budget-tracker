import { supabase } from '@/utils/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { AUTH_SESSION_KEY } from './query';
import { redirectTo } from './utils';

type EmailCredentials = {
    email: string;
    password: string;
};

async function signInWithEmail({ email, password }: EmailCredentials) {
    try {
        console.log('signInWithEmail react query');
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    } catch (error) {
        // TODO: replace with Alert from TAMAGUI
        console.error('--> sign in with email error', error);
    }
}

export function useSignInWithEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signInWithEmail,
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_SESSION_KEY, () => {
                return {
                    session: data?.session,
                    user: data?.user,
                };
            });
            router.replace('/');
        },
        onError: (error) => {
            Alert.alert(error.message);
        },
    });
}

async function signUpWithEmail({ email, password }: EmailCredentials) {
    try {
        console.log('signUpWithEmail react query');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
            },
        });

        // TODO: move to useSignUpWithEmail
        if (error) Alert.alert(error.message);
        if (!data.session)
            Alert.alert(
                'Please check your inbox for email verification!, your redirect link: ' +
                    redirectTo,
            );
        router.replace('/');
        return data;
    } catch (error) {
        console.error('--> sign up with email error', error);
    }
    return null;
}

export function useSignUpWithEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signUpWithEmail,
        onSuccess: (data) => {
            queryClient.setQueryData(AUTH_SESSION_KEY, () => {
                return {
                    session: data?.session,
                    user: data?.user,
                };
            });
        },
    });
}

async function signOut() {
    try {
        console.log('signOut react query');
        return supabase.auth.signOut();
    } catch (error) {
        console.error('--> sign out error', error);
    }
}

export function useSignOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            queryClient.setQueryData(AUTH_SESSION_KEY, () => {
                return {
                    session: null,
                    user: null,
                };
            });
        },
    });
}
