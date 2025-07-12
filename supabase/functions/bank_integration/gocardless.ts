import {
  BankAccount,
  EndUserAgreement,
  GoCardlessSession,
  RequisitionData,
} from "./types.ts";
import * as session from "./session.ts";
import { SupabaseClient } from "@supabase/supabase-js";

const GOCARDLESS_API_ENDPOINT = Deno.env.get("GOCARDLESS_API_ENDPOINT") || "";
const GOCARDLESS_API_SECRET_ID = Deno.env.get("GOCARDLESS_API_SECRET_ID") || "";
const GOCARDLESS_API_SECRET_KEY = Deno.env.get("GOCARDLESS_API_SECRET_KEY") ||
  "";

export async function getToken(
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<GoCardlessSession> {
  try {
    const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/token/new/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        secret_id: GOCARDLESS_API_SECRET_ID,
        secret_key: GOCARDLESS_API_SECRET_KEY,
      }),
    });
    const data = await res.json();
    const now = new Date();
    const sessionData = {
      accessToken: data.access,
      refreshToken: data.refresh,
      accessExpires: new Date(now.getTime() + data.access_expires * 1000)
        .toISOString(),
      refreshExpires: new Date(now.getTime() + data.refresh_expires * 1000)
        .toISOString(),
    };

    console.log("===> new token: ", sessionData);

    await session.saveGoCardlessSession(userId, sessionData, supabaseClient);
    return sessionData;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get new token");
  }
}

export async function refreshToken(
  userId: string,
  existingSession: GoCardlessSession,
  supabaseClient: SupabaseClient,
): Promise<GoCardlessSession> {
  try {
    const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        refresh: existingSession.refreshToken,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to refresh token: ${res.statusText}`);
    }

    const data = await res.json();
    const now = new Date();
    const sessionData = {
      accessToken: data.access,
      refreshToken: existingSession.refreshToken,
      accessExpires: new Date(now.getTime() + data.access_expires * 1000)
        .toISOString(),
      refreshExpires: existingSession.refreshExpires,
    };

    console.log("===>>> refresh teken: ", sessionData);

    await session.saveGoCardlessSession(userId, sessionData, supabaseClient);
    return sessionData;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to refresh token");
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getBankAccounts(
  userId: string,
  accessToken: string,
): Promise<BankAccount[]> {
  const res = await fetch(`${GOCARDLESS_API_ENDPOINT}/accounts/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

export async function getTransactions(accountId: string, accessToken: string) {
  const res = await fetch(
    `${GOCARDLESS_API_ENDPOINT}/accounts/${accountId}/transactions`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return await res.json();
}

export async function createEndUserAgreement(
  institutionId: string,
  accessToken: string,
): Promise<EndUserAgreement> {
  const response = await fetch(
    `${GOCARDLESS_API_ENDPOINT}/agreements/enduser/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        institution_id: institutionId,
        max_historical_days: 180,
        access_valid_for_days: 90,
        access_scope: ["balances", "details", "transactions"],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create end user agreement: ${JSON.stringify(response)}`,
    );
  }

  return response.json();
}

export async function getRequisition({
  userId,
  institutionId,
  supabaseClient
}: {
  userId: string;
  institutionId: string;
  supabaseClient: SupabaseClient
}): Promise<RequisitionData> {
    const { data, error } = await supabaseClient.from('requisitions').select('*').eq('user_id', userId).eq('institution_id', institutionId)
    if (error) {
        throw error
    }
    return data[0] as RequisitionData
}

export async function createRequisition(
  {
    userId,
    institutionId,
    agreementId,
    redirectUrl,
    accessToken,
  }: {
    userId: string;
    institutionId: string;
    agreementId?: string;
    redirectUrl: string;
    accessToken: string;
  },
  supabaseClient: SupabaseClient,
): Promise<RequisitionData> {
  const response = await fetch(`${GOCARDLESS_API_ENDPOINT}/requisitions/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      redirect: redirectUrl,
      institution_id: institutionId,
      agreement: agreementId,
      user_language: "EN",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create requisition");
  }

  const requisition = await response.json();
  const requisitionData = {
    requisition_id: requisition.id,
    institution_id: institutionId,
    user_id: userId,
  }

  const { error } = await supabaseClient.from("requisitions").insert(requisitionData);

  if (error) {
    throw error;
  }

  return requisitionData
}

export async function getInstitutions(
  countryCode: string,
  accessToken: string,
) {
  const response = await fetch(
    `${GOCARDLESS_API_ENDPOINT}/institutions/?country=${countryCode}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch institutions: ${response.statusText}`);
  }

  return response.json();
}
