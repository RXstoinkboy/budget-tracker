import { supabase } from '@/utils/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
// import { useStorageState } from './useStorageState';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        console.log('--> START auto refersh session');
        supabase.auth.startAutoRefresh();
    } else {
        console.log('--> STOP auto refersh session');
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

const AuthContext = createContext<{
    signInWithEmail: (credentials: EmailCredentials) => Promise<void>;
    signUpWithEmail: (credentials: EmailCredentials) => Promise<void>;
    signOut: () => void;
    session?: Session | null;
    user?: User | null;
    isLoading: boolean;
}>({
    signInWithEmail: () => Promise.resolve(),
    signUpWithEmail: () => Promise.resolve(),
    signOut: () => null,
    session: null,
    isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }

    return value;
}

type EmailCredentials = {
    email: string;
    password: string;
};

export function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(false);

    async function signInWithEmail({ email, password }: EmailCredentials) {
        try {
            console.log('signInWithEmail');
            setLoading(true);
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('-> data', data);

            if (error) Alert.alert(error.message);
            setSession(data.session);
            setUser(data.user);
            router.replace('/');
        } catch (error) {
            // TODO: replace with Alert from TAMAGUI
            console.error('--> sign in with email error', error);
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail({ email, password }: EmailCredentials) {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                },
            });

            if (error) Alert.alert(error.message);
            if (!data.session)
                Alert.alert(
                    'Please check your inbox for email verification!, your redirect link: ' +
                        redirectTo,
                );
            setSession(data.session);
            setUser(data.user);
            router.replace('/');
        } catch (error) {
            console.error('--> sign up with email error', error);
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        try {
            setLoading(true);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
        } catch (error) {
            console.error('--> sign out error', error);
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        // Check initial auth state
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                signInWithEmail,
                signUpWithEmail,
                signOut,
                session,
                user,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
