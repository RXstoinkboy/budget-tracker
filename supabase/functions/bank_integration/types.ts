export type GoCardlessSession = {
  accessToken: string;
  refreshToken: string;
  accessExpires: string;
  refreshExpires: string;
};

export type GoCardlessSessionDto = {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  access_expires: string;
  refresh_expires: string;
};

export type BankAccount = {
  id: string;
  balance: number;
  currency: string;
  accountType: string;
  accountNumber: string;
};

export interface EndUserAgreement {
  id: string;
  created: string;
  max_historical_days: number;
  access_valid_for_days: number;
  access_scope: string[];
  accepted: string;
  institution_id: string;
}

export interface RequisitionResponse {
  id: string;
  redirect: string;
  status: {
    short: string;
    long: string;
    description: string;
  };
  agreement: string;
  accounts: string[];
  reference: string;
  user_language: string;
  link: string;
}

export type RequisitionData = {
  requisition_id: string;
  institution_id: string;
  user_id: string;
  status: "pending" | "linked" | "error";
};
