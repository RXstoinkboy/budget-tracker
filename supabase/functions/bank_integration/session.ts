import { createClient } from '@supabase/supabase-js';
import { GoCardlessSession } from './types.ts';

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
        auth: {
            persistSession: false,
        },
    },
);

export async function validateGoCardlessSession(session: any) {
    if (!session?.data || session.data.length === 0) {
        return null;
    }
    const sessionData = session.data[0];
    const now = new Date();
    const accessExpires = new Date(sessionData.access_expires);
    const refreshExpires = new Date(sessionData.refresh_expires);

    if (accessExpires > now) {
        return { accessToken: sessionData.access_token };
    }
    if (refreshExpires > now) {
        return { refreshToken: sessionData.refresh_token };
    }
    return null;
}

export async function fetchSavedGoCardlessSession(userId: string) {
    return await supabase.from('gocardless_sessions').select('*').eq('user_id', userId);
}

export async function saveGoCardlessSession(userId: string, session: GoCardlessSession) {
    await supabase.from('gocardless_sessions').insert([
        {
            user_id: userId,
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.accessExpires,
            refresh_expires: session.refreshExpires,
        },
    ]);
}

export async function updateGoCardlessSession(userId: string, session: GoCardlessSession) {
    await supabase
        .from('gocardless_sessions')
        .update({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.accessExpires,
            refresh_expires: session.refreshExpires,
        })
        .eq('user_id', userId);
}

export async function getGocardlessSession(userId: string): Promise<GoCardlessSession | null> {
    const savedSession = await fetchSavedGoCardlessSession(userId);
    const validatedSession = await validateGoCardlessSession(savedSession);

    if (!validatedSession) {
        return null;
    }

    return validatedSession;
}
