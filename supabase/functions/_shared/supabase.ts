import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (token: string) => createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
        auth: {
            persistSession: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    },
);