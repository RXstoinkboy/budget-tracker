import { SupabaseClient } from '@supabase/supabase-js';

export const getAuthToken = (req: Request): string => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new Error('Invalid token format');
    }

    return token;
};

export const getUser = async (token: string, supabaseClient: SupabaseClient) => {
    const {
        data: { user },
        error,
    } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    return user;
};
