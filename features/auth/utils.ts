import { supabase } from '@/utils/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { AppState } from 'react-native';

export async function createSessionFromUrl(url: string) {
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
}

// TODO: it should handle prod vs dev automatically but it doesn't for some reason :(
export const redirectTo = makeRedirectUri({
    scheme: __DEV__ ? 'exp' : 'com.budgettracker',
    // path: 'about',
});

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
export function autoRefreshSession() {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            console.log('--> START auto refersh session');
            supabase.auth.startAutoRefresh();
        } else {
            console.log('--> STOP auto refersh session');
            supabase.auth.stopAutoRefresh();
        }
    });
}
