import { supabase } from "@/utils/supabase";
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from "@tanstack/react-query";
import { InstitutionDto, LinkWithInstitutionParams } from "./types";

export const integrationsKeys = {
    all: ["integrations"] as const,
    lists: () => [...integrationsKeys.all, "list"] as const,
    institutions: (countryCode: string) =>
        [...integrationsKeys.lists(), "institutions", { countryCode }] as const,
    requisitions: () => [...integrationsKeys.lists(), "requisitions"] as const,
    requisition: (requisitionId: string) =>
        [...integrationsKeys.requisitions(), { requisitionId }] as const,
    accounts: () => [...integrationsKeys.lists(), "accounts"],
    account: (accountId: string) =>
        [...integrationsKeys.accounts(), { accountId }] as const,
};

const getIntegrations = async (countryCode: string) => {
    const { data, error } = await supabase.functions.invoke(
        `bank_integration/institutions?country=${countryCode}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
    );

    if (error) {
        throw error;
    }

    return data;
};

const linkWithInstitution = async (body: LinkWithInstitutionParams) => {
    const { data, error } = await supabase.functions.invoke(
        `bank_integration/requisitions/init`,
        {
            method: "POST",
            body,
        },
    );

    if (error) {
        throw error;
    }

    return data;
};

export const useGetInstitutions = (countryCode: string) => {
    return useQuery<InstitutionDto[], Error>({
        queryKey: integrationsKeys.institutions(countryCode),
        queryFn: () => getIntegrations(countryCode),
    });
};

export const useLinkWithInstitution = (options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}) => {
    return useMutation({
        mutationFn: async (body: LinkWithInstitutionParams) => {
            const data = await linkWithInstitution(body);

            return data;
        },
        onSuccess: async (data) => {
            // Open the link in the browser
            // TODO: restore redirecting user to the bank login page
            // if (data?.link) {
            //     await Linking.openURL(data.link);
            // }

            options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
            console.error("Error linking with institution:", error);
            options?.onError?.(error);
        },
    });
};

const updateRequisitionStatus = async (
    { requisitionId, ...body }: UpdateRequisitionStatusParams,
) => {
    console.log("calling finalize mutation", requisitionId, body);
    const { error } = await supabase.functions.invoke(
        `bank_integration/requisitions/${requisitionId}/finalize`,
        {
            method: "PUT",
            body,
        },
    );

    if (error) {
        throw error;
    }
};

type UpdateRequisitionStatusParams = {
    requisitionId: string;
    status: "pending" | "linked" | "error";
};

export const useUpdateRequisitionStatus = (
    options?: UseMutationOptions<any, Error, UpdateRequisitionStatusParams>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body) => {
            await updateRequisitionStatus(body);
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: integrationsKeys.accounts(),
            });

            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
};

export type AccountDto = {
    id: string;
    requisition_id: string;
    user_id: string;
    status: string;
};

const getAccounts = async (): Promise<AccountDto[]> => {
    const { data, error } = await supabase.functions.invoke(
        `bank_integration/accounts`,
        {
            method: "GET",
        },
    );

    if (error) {
        throw error;
    }

    return data;
};

export const useGetAccounts = (
    options?: UseQueryOptions<AccountDto[], Error>,
) => {
    return useQuery<AccountDto[], Error>({
        queryKey: integrationsKeys.accounts(),
        queryFn: getAccounts,
        ...options,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};

export type AccountWithDetailsDto = AccountDto & {
    iban: string;
    bban: string;
    owner_name: string;
    name: string;
    institution_name: string;
    institution_logo: string;
    institution_bic: string;
};

const getAccountWithDetails = async (
    accountId: string,
): Promise<AccountWithDetailsDto> => {
    const { data, error } = await supabase.functions.invoke(
        `bank_integration/accounts/${accountId}`,
        {
            method: "GET",
        },
    );

    if (error) {
        throw error;
    }

    return data;
};

export const useGetAccount = (
    accountId: string,
    options?: UseQueryOptions<AccountWithDetailsDto, Error>,
) => {
    return useQuery<AccountWithDetailsDto, Error>({
        queryKey: integrationsKeys.account(accountId),
        queryFn: () => getAccountWithDetails(accountId),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        ...options,
    });
};
