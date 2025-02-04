import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { autoRefreshSession, createSessionFromUrl } from './utils';
import * as Linking from 'expo-linking';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys, useAuthSession } from './query';

// used in conjunction with ./utils/autoRefreshSession to continuously refresh the session (only when app is in the foreground)
export function useSubscribeToSession() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            queryClient.setQueryData(authKeys.session(), () => {
                return {
                    session,
                    user: session?.user ?? null,
                };
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [queryClient]);
}

// used to create a session from URL after user is redirected to the app from the browser
// e.g. after user is successfully signed up and redirected with verification link
export function useCreateSessionFormUrl() {
    useEffect(() => {
        // Handle deep linking
        const subscription = Linking.addEventListener('url', ({ url }) => {
            createSessionFromUrl(url);
        });

        return () => {
            subscription.remove();
        };
    }, []);
}

export function useInitiateAuth() {
    useAuthSession();

    autoRefreshSession();
    useSubscribeToSession();
    useCreateSessionFormUrl();
}
