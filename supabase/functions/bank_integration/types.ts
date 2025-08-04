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

export type BankAccountResponse = {
  id: string;
  created: string;
  last_accessed: string;
  iban: string;
  bban: string;
  status: string;
  institution_id: string;
  owner_name: string;
  name: string;
};

export type BankAccountDto = {
  id: string;
  requisition_id: string;
  user_id: string;
  status: string;
  created_at: string;
  // iban: string;
  // bban: string;
  // institution_id: string;
  // institution_name: string;
  // institution_logo: string;
  // owner_name: string;
  // name: string;
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

export type InstitutionResponse = {
  id: string;
  name: string;
  bic: string;
  logo: string;
};
