import { GoCardlessSession, BankAccount, EndUserAgreement, Requisition } from './types.ts';
import * as session from './session.ts';

const GOCARDLESS_API_ENDPOINT = Deno.env.get('GOCARDLESS_API_ENDPOINT') || '';
const GOCARDLESS_API_SECRET_ID = Deno.env.get('GOCARDLESS_API_SECRET_ID') || '';
const GOCARDLESS_API_SECRET_KEY = Deno.env.get('GOCARDLESS_API_SECRET_KEY') || '';

export async function getToken(userId: string): Promise<GoCardlessSession> {
    try {
        const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/token/new/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({
                secret_id: GOCARDLESS_API_SECRET_ID,
                secret_key: GOCARDLESS_API_SECRET_KEY,
            }),
        });
        const data = await res.json();
        const sessionData = {
            accessToken: data.access,
            refreshToken: data.refresh,
            accessExpires: data.access_expires,
            refreshExpires: data.refresh_expires,
        };

        await session.saveGoCardlessSession(userId, sessionData);
        return sessionData;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get new token');
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getBankAccounts(userId: string, accessToken: string): Promise<BankAccount[]> {
    const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/accounts/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return await res.json();
}

export async function getTransactions(accountId: string, accessToken: string) {
    const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/accounts/${accountId}/transactions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return await res.json();
}

export async function createEndUserAgreement(
    institutionId: string,
    accessToken: string,
): Promise<EndUserAgreement> {
    const response = await fetch(`${GOCARDLESS_API_ENDPOINT}/agreements/enduser/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            institution_id: institutionId,
            max_historical_days: 180,
            access_valid_for_days: 90,
            access_scope: ['balances', 'details', 'transactions'],
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create end user agreement');
    }

    return response.json();
}

export async function createRequisition(
    institutionId: string,
    agreementId: string,
    redirectUrl: string,
    accessToken: string,
): Promise<Requisition> {
    const response = await fetch(`${GOCARDLESS_API_ENDPOINT}/requisitions/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            redirect: redirectUrl,
            institution_id: institutionId,
            agreement: agreementId,
            user_language: 'EN',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create requisition');
    }

    return response.json();
}
