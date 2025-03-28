export type GoCardlessSession = {
    accessToken: string;
    refreshToken: string;
    accessExpires: Date;
    refreshExpires: Date;
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

export interface Requisition {
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
