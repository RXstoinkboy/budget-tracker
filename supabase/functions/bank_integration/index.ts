/// <reference types="@supabase/supabase-js" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import '@supabase/supabase-js';
import { getUser, getAuthToken } from './auth.ts';
import { corsHeaders } from '../_shared/cors.ts';
import * as gocardless from './gocardless.ts';
import * as session from './session.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';

// TODO: session is not being saved to database

// Update the main serve function to handle different endpoints
Deno.serve(async (req) => {
    // Always handle OPTIONS requests first
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        // return new Response(null, {
        //     headers: corsHeaders,
        //     status: 204,
        // });
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders });
        }
    }

    try {
        const token = getAuthToken(req);
        const supabaseClient = createSupabaseClient(token)
        const user = await getUser(token, supabaseClient)

        const url = new URL(req.url);

        // Remove leading and trailing slashes and split
        const fullPath = url.pathname.replace(/^\/|\/$/g, '').split('/');

        // In production, the path might include 'functions/v1/bank_integration'
        // Find the index of 'bank_integration' if it exists in the path
        const bankIntegrationIndex = fullPath.indexOf('bank_integration');

        // Get the actual endpoint path (everything after 'bank_integration')
        const path =
            bankIntegrationIndex >= 0 ? fullPath.slice(bankIntegrationIndex + 1) : fullPath;

        // Initialize GoCardless session
        let goCardlessSession = await session.getGocardlessSession(user.id, supabaseClient);
        if (!goCardlessSession) {
            goCardlessSession = await gocardless.getToken(user.id, supabaseClient);
        }

        const now = new Date();
        const bufferTimeMs = 2 * 60 * 1000; // 2 minutes in milliseconds
        const accessExpiresDate = new Date(goCardlessSession.accessExpires);
        
        if (accessExpiresDate.getTime() < now.getTime() + bufferTimeMs) {
            try {
                goCardlessSession = await gocardless.refreshToken(
                    user.id,
                    goCardlessSession,
                    supabaseClient
                );
            } catch (error) {
                // If refresh token fails, get a new token
                console.log('Refresh token failed, getting new token');
                goCardlessSession = await gocardless.getToken(user.id, supabaseClient);
            }
        }

        // Handle different endpoints based on the first part of the processed path
        switch (path[0] || '') {
            case 'institutions':
                const countryCode = url.searchParams.get('country') || 'GB';
                const institutions = await gocardless.getInstitutions(
                    countryCode,
                    goCardlessSession.accessToken,
                );
                return new Response(JSON.stringify(institutions), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            case 'accounts':
                const { requisitionId } = await req.json();

                const accounts = await gocardless.getBankAccounts(
                    user.id,
                    goCardlessSession.accessToken,
                );
                return new Response(JSON.stringify(accounts), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            case 'link':
                if (req.method !== 'POST') {
                    throw new Error('Method not allowed');
                }

                const { institutionId, redirectUrl } = await req.json();

                if (!institutionId || !redirectUrl) {
                    throw new Error('Institution ID and redirect URL are required');
                }

                // Create end user agreement
                // const agreement = await gocardless.createEndUserAgreement(
                //     institutionId,
                //     goCardlessSession.accessToken,
                // );

                // Create requisition with the agreement
                const requisition = await gocardless.createRequisition(
                    {
                        institutionId,
                        userId: user.id,
                        // agreementId: agreement?.id,
                        redirectUrl,
                        accessToken: goCardlessSession.accessToken,
                    },
                    supabaseClient
                );

                return new Response(JSON.stringify(requisition), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            // Handle empty path (root endpoint)
            case '':
                return new Response(JSON.stringify({ message: 'Bank Integration API' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });

            default:
                return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
        }
    } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'An unexpected error occurred';
        let statusCode = 500;
        
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes('Unauthorized')) {
                statusCode = 401;
            }
        }
        
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/bank_integration/institutions' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
