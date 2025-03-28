/// <reference types="@supabase/supabase-js" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/supabase-js';
import { authenticateUser } from './auth.ts';
import * as gocardless from './gocardless.ts';
import * as session from './session.ts';

// Update the main serve function to handle different endpoints
Deno.serve(async (req) => {
    try {
        const user = await authenticateUser(req);
        const url = new URL(req.url);
        const path = url.pathname.split('/').filter(Boolean);

        // Initialize GoCardless session
        const goCardlessSession = await session.getGoGardlessSession(user.id);
        if (!goCardlessSession?.accessToken) {
            throw new Error('Failed to initialize GoCardless session');
        }

        // Handle different endpoints
        switch (path[0]) {
            case 'institutions':
                const countryCode = url.searchParams.get('country') || 'GB';
                const institutions = await gocardless.getInstitutionsList(
                    countryCode,
                    goCardlessSession.accessToken,
                );
                return new Response(JSON.stringify(institutions), {
                    headers: { 'Content-Type': 'application/json' },
                });

            case 'accounts':
                const accounts = await gocardless.getBankAccounts(
                    user.id,
                    goCardlessSession.accessToken,
                );
                return new Response(JSON.stringify(accounts), {
                    headers: { 'Content-Type': 'application/json' },
                });

            case 'transactions':
                const accountId = path[1];
                if (!accountId) {
                    throw new Error('Account ID is required');
                }
                const transactions = await gocardless.getTransactions(
                    accountId,
                    goCardlessSession.accessToken,
                );
                return new Response(JSON.stringify(transactions), {
                    headers: { 'Content-Type': 'application/json' },
                });

            case 'link':
                if (req.method !== 'POST') {
                    throw new Error('Method not allowed');
                }

                const body = await req.json();
                const { institutionId, redirectUrl } = body;

                if (!institutionId || !redirectUrl) {
                    throw new Error('Institution ID and redirect URL are required');
                }

                // Create end user agreement
                const agreement = await gocardless.createEndUserAgreement(
                    institutionId,
                    goCardlessSession.accessToken,
                );

                // Create requisition with the agreement
                const requisition = await gocardless.createRequisition(
                    institutionId,
                    agreement.id,
                    redirectUrl,
                    goCardlessSession.accessToken,
                );

                return new Response(JSON.stringify(requisition), {
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
