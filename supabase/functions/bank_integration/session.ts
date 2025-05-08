import { GoCardlessSession, GoCardlessSessionDto } from './types.ts';
import { SupabaseClient } from '@supabase/supabase-js';

export function validateGoCardlessSession(session: GoCardlessSessionDto) {
    if (!session) {
        return null;
    }
    const sessionData = session;
    const now = new Date();
    const accessExpires = new Date(sessionData.access_expires);
    const refreshExpires = new Date(sessionData.refresh_expires);

    if (accessExpires > now || refreshExpires > now) {
        return {
            accessToken: sessionData.access_token,
            refreshToken: sessionData.refresh_token,
            accessExpires: sessionData.access_expires,
            refreshExpires: sessionData.refresh_expires
        };
    }
    
    return null;
}

export async function fetchSavedGoCardlessSession(userId: string, supabaseClient: SupabaseClient) {
        const { data, error } = await supabaseClient.from('gocardless_sessions').select('*').eq('user_id', userId);
        console.log('===> fetchSavedGoCardlessSession data: ', data)
        if (error) {
            console.error('Error fetching GoCardless session:', error);
            throw error;
        }
        return data[0] as GoCardlessSessionDto;
}

export async function saveGoCardlessSession(userId: string, session: GoCardlessSession, supabaseClient: SupabaseClient) {
    console.log('Saving GoCardless session for user:', userId);
    console.log('Session data:', session);
    
    const { data, error } = await supabaseClient.from('gocardless_sessions').upsert([
        {
            user_id: userId,
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.accessExpires,
            refresh_expires: session.refreshExpires,
        },
    ]);

    if (error) {
        console.error('Error saving GoCardless session:', error);
        throw error;
    }

    console.log('Successfully saved session:', data);
    return data;
}

export async function updateGoCardlessSession(userId: string, session: GoCardlessSession, supabaseClient: SupabaseClient) {
    await supabaseClient
        .from('gocardless_sessions')
        .update({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.accessExpires,
            refresh_expires: session.refreshExpires,
        })
        .eq('user_id', userId);
}

export async function getGocardlessSession(userId: string, supabaseClient: SupabaseClient): Promise<GoCardlessSession | null> {
    const savedSession = await fetchSavedGoCardlessSession(userId, supabaseClient);
    const validatedSession = validateGoCardlessSession(savedSession);

    if (!validatedSession) {
        return null;
    }

    console.log('===> getGocardlessSession validatedSession: ', validatedSession)

    return validatedSession;
}
