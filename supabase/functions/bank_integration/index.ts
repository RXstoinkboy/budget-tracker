/// <reference types="@supabase/supabase-js" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Add these types at the top of the file
type GoCardlessSession = {
    accessToken: string;
    refreshToken: string;
    accessExpires: Date;
    refreshExpires: Date;
};

type BankAccount = {
    id: string;
    balance: number;
    currency: string;
    accountType: string;
    accountNumber: string;
};

// Add at the top level, before any functions
const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
        auth: {
            persistSession: false,
        },
    },
);

// Replace hardcoded values with environment variables
const GOCARDLESS_API_ENDPOINT = Deno.env.get('GOCARDLESS_API_ENDPOINT') || '';
const GOCARDLESS_API_SECRET_ID = Deno.env.get('GOCARDLESS_API_SECRET_ID') || '';
const GOCARDLESS_API_SECRET_KEY = Deno.env.get('GOCARDLESS_API_SECRET_KEY') || '';

const authenticateUser = async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = authHeader.split(' ')[1];

        // Authenticate the user
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return user;
    } catch (error) {
        console.error('Authentication error: ', error);
    }
};

const getToken = async (userId: string) => {
    try {
        const res = await Deno.fetch(
            `${GOCARDLESS_API_KEY}token/new/`,
            {
                secret_id: GOCARDLESS_API_SECRET_ID,
                secret_key: GOCARDLESS_API_SECRET_KEY,
                method: 'POST',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            },
        );
        // Save the session to database
        await saveGoCardlessSession(userId, {
            accessToken: res.data.access,
            refreshToken: res.data.refresh,
            accessExpires: res.data.access_expires,
            refreshExpires: res.data.refresh_expires,
        });

        return {
            accessToken: res.data.access,
            refreshToken: res.data.refresh,
            accessExpires: res.data.access_expires,
            refreshExpires: res.data.refresh_expires,
        };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get new token');
    }
};

const getGoGardlessSession = async (userId: string): Promise<GoCardlessSession | null> => {
    try {
        const session = await fetchSavedGoCardlessSession(userId);
        const validationResult = validateGoCardlessSession(session);

        if (validationResult === null) {
            return await getToken(userId);
        }
        if (validationResult.refreshToken) {
            return await refreshGoCardlessSession(userId, validationResult.refreshToken);
        }
        if (validationResult.accessToken) {
            return session;
        }
        return null;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get GoCardless session');
    }
};

const ensureToken = async (userId: string): Promise<string> => {
    const session = await getGoGardlessSession(userId);
    if (!session?.accessToken) {
        throw new Error('Failed to get access token');
    }
    return session.accessToken;
};

// Update getInstitutionsList to use the correct endpoint
const getInstitutionsList = async (countryCode: string) => {
    try {
        if (!countryCode) {
            throw new Error('Country code is required');
        }
        const accessToken = await ensureToken('GB');

        const res = await Deno.fetch(
            `${GOCARDLESS_API_ENDPOINT}institutions/?country=${countryCode}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            },
        );
        return await res.json();
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get institutions');
    }
};

async function validateGoCardlessSession(session: any) {
    if (!session?.data || session.data.length === 0) {
        return null;
    }
    const sessionData = session.data[0];
    const now = new Date();
    const accessExpires = new Date(sessionData.access_expires);
    const refreshExpires = new Date(sessionData.refresh_expires);

    if (accessExpires > now) {
        return {
            accessToken: sessionData.access_token,
        };
    }
    if (refreshExpires > now) {
        return {
            refreshToken: sessionData.refresh_token,
        };
    }
    return null;
}

async function fetchSavedGoCardlessSession(userId: string) {
    const session = await supabase.from('gocardless_sessions').select('*').eq('user_id', userId);

    return session;
}

async function saveGoCardlessSession(userId: string, session: GoCardlessSession) {
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

async function updateGoCardlessSession(userId: string, session: GoCardlessSession) {
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

async function refreshGoCardlessSession(userId: string, refreshToken: string) {
    try {
        const res = await Deno.fetch(
            `${GOCARDLESS_API_ENDPOINT}token/refresh/`,
            {
                refresh: refreshToken,
                method: 'POST',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            },
        );
        console.log('refresh go cardless access token', res.data);

        const session = await getToken(userId);

        await updateGoCardlessSession(userId, {
            ...res.data,
            ...session,
        });

        return session;
    } catch (error) {
        console.error(error);
        new Response(JSON.stringify({ error: 'Failed to refresh GoCardless session' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Add new functions to handle bank account operations
async function getBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
        const accessToken = await ensureToken(userId);
        const res = await fetch(`${GOCARDLESS_API_ENDPOINT}accounts/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        throw new Error('Failed to fetch bank accounts');
    }
}

async function handleGetTransactions(accountId: string) {
    try {
        const accessToken = await ensureToken('GB');
        const res = await fetch(`${GOCARDLESS_API_ENDPOINT}accounts/${accountId}/transactions`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

// Update the main serve function to handle different endpoints
Deno.serve(async (req) => {
    try {
        const user = await authenticateUser(req);
        const url = new URL(req.url);
        const path = url.pathname.split('/').filter(Boolean);

        // Initialize GoCardless session
        await getGoGardlessSession(user.id);

        // Handle different endpoints
        switch (path[0]) {
            case 'institutions':
                const countryCode = url.searchParams.get('country') || 'GB';
                const institutions = await getInstitutionsList(countryCode);
                return new Response(JSON.stringify(institutions), {
                    headers: { 'Content-Type': 'application/json' },
                });

            case 'accounts':
                const accounts = await getBankAccounts(user.id);
                return new Response(JSON.stringify(accounts), {
                    headers: { 'Content-Type': 'application/json' },
                });

            case 'transactions':
                const accountId = path[1];
                if (!accountId) {
                    throw new Error('Account ID is required');
                }
                const transactions = await handleGetTransactions(accountId);
                return new Response(JSON.stringify(transactions), {
                    headers: { 'Content-Type': 'application/json' },
                });

            default:
                return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
        }
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/gocardless-integration' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
