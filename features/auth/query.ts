import { supabase } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';

export const authKeys = {
    all: ['auth'] as const,
    session: () => [...authKeys.all, 'session'] as const,
};

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
        queryKey: authKeys.session(),
        queryFn: getSession,
    });
}
