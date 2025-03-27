/// <reference types="@supabase/supabase-js" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

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

        userId = user.id;

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

const getToken = async () => {
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
        // TODO: store access token and refresh token in DB
        // or not really because it has to be verified each time to make sure that my app has access to gocardless API
        // can I assign it like that in memory? I think I should be able to do it
        accessToken = res.data.access;
        refreshToken = res.data.refresh;
        accessExpires = res.data.access_expires;
        refreshExpires = res.data.refresh_expires;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get new token');
    }
};

const ensureToken = async () => {
    // TODO: I should also ensure that accessToken is not expired
    // TODO: if accessToken is expired then I should check for refresh token and use it to get new access token
    if (!accessToken) {
        await getToken();
    }
};

const getInstitutionsList = async (countryCode: string) => {
    try {
        if (!countryCode) {
            throw new Error('Country code is required');
        }
        await ensureToken();

        const res = await Deno.fetch(`institutions/?country=${countryCode}`, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return res.data;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get institutions');
    }
};

async function validateGoCardlessSession(userId: string) {
    /**
     * TODO:
     * now validate the session
     * firest validate access_expires
     * if it is still valid then return the session
     * if no then check refresh_expires
     * if it is still valid then use it to refresh the session and then returen the session
     * if it is not valid then delete the session, get new access token and create new session
     * */

    if (session.length === 0) {
        return null;
    }
    const sessionData = session[0];

    if (sessionData.access_expires > new Date()) {
        return {
            accessToken: sessionData.access_token,
        };
    }
    if (sessionData.refresh_expires > new Date()) {
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

async function saveGoCardlessSession(userId: string, session: any) {
    await supabase.from('gocardless_sessions').insert([
        {
            user_id: userId,
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.expiresAt,
            refresh_expires: session.refreshExpires,
        },
    ]);
}

async function updateGoCardlessSession(userId: string, session: any) {
    await supabase
        .from('gocardless_sessions')
        .update({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            access_expires: session.expiresAt,
            refresh_expires: session.refreshExpires,
        })
        .eq('user_id', userId);
}

async function deleteGoCardlessSession(userId: string) {
    await supabase.from('gocardless_sessions').delete().eq('user_id', userId);
}

async function refreshGoCardlessSession(refreshToken: string) {
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

        accessToken = res.data.access;
        accessExpires = res.data.access_expires;

        await updateGoCardlessSession(userId, {
            ...res.data,
            refreshToken,
            refreshExpires,
        });

        return {
            accessToken,
            accessExpires,
        };
    } catch (error) {
        console.error(error);
        new Response(JSON.stringify({ error: 'Failed to refresh GoCardless session' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

const getGoGardlessSession = async (userId: string) => {
    try {
        const session = await fetchSavedGoCardlessSession(userId);
        // TODO: this is used in couple of places. Maybe I don't want to store it in memory?
        accessToken = session.access_token;
        accessExpires = session.access_expires;
        refreshToken = session.refresh_token;
        refreshExpires = session.refresh_expires;

        const validationResult = validateGoCardlessSession(session);

        if (validationResult === null) {
            await getToken();
        }
        if (validationResult.refreshToken) {
            const refreshedSession = await refreshGoCardlessSession(validationResult.refreshToken);

            return {
                ...session,
                ...refreshedSession,
            };
        }
        if (validationResult.accessToken) {
            return session;
        }
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get GoCardless session');
    }
};

async function handleGetTransactions(accountId: string) {
    // Implement logic to fetch transactions for a given accountId
    console.log(`Fetching transactions for account: ${accountId}`);
    // Replace this with your actual implementation
    return { transactions: [] };
}

async function handleConnectBank(bankDetails: any) {
    // Implement the logic to connect a bank
    console.log(`Connecting bank with details: ${JSON.stringify(bankDetails)}`);
    // Replace this with your actual implementation
    return { success: true, message: 'Bank connected successfully' };
}

Deno.serve(async (req) => {
    console.log('Hello from Functions!');
    // TODO: take care of this in memory variables. THey should not be used at all...
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let accessExpires: number | undefined;
    let refreshExpires: number | undefined;
    let userId = string | undefined;

    // TODO: all of these have to be moved to supabase secret
    const GOCARDLESS_API_ENDPOINT = 'https://bankaccountdata.gocardless.com/api/v2/';
    const GOCARDLESS_API_SECRET_ID = 'dea3d755-7975-4c76-8bee-51d823e31e90';
    const GOCARDLESS_API_SECRET_KEY =
        'd0951459c809e3e85980b1f9d0b42f32a5b3bdfd49a8db91738aff5d80c5f9fdb140a6d262caa56bf175d983b5bd2180b0e84f4dd35c0b92b2f2154f33e673fd'; /// TODO: move to supabase secret
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

    console.log({
        GOCARDLESS_API_ENDPOINT,
        GOCARDLESS_API_SECRET_ID,
        GOCARDLESS_API_SECRET_KEY,
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
    });

    // this is my supabase client to perform all kinds of interactions with supabase (auth/db etc)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
        },
    });

    await authenticateUser(req);

    // Fetch the GoCardless session details from your Supabase table
    const goCardlessSession = await getGoGardlessSession(user.id);

    if (!goCardlessSession) {
        return new Response(
            JSON.stringify({ error: 'Error connecting to bank connection service' }),
            { status: 400 },
        );
    }

    // TODO: agree to fetch transactions/balance/account data for the accounts connected for the user
    // TODO: prepare an actualy response with requested data by the user: transactions/balance/account data
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/gocardless-integration' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
