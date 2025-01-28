import { supabase } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';

export const AUTH_SESSION_KEY = ['auth-session'];

export async function getSession() {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    return {
        session,
        user: session?.user ?? null,
    };
}

export function useAuthSession() {
    return useQuery({
        queryKey: AUTH_SESSION_KEY,
        queryFn: getSession,
    });
}
