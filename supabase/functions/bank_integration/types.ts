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
