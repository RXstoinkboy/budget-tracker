import { GoCardlessSession, BankAccount } from './types.ts';
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
