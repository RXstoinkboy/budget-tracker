import { supabase } from "@/utils/supabase";
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { InstitutionDto, LinkWithInstitutionParams } from "./types";
import { Linking } from "react-native";

export const integrationsKeys = {
    all: ["integrations"] as const,
    lists: () => [...integrationsKeys.all, "list"] as const,
    list: (countryCode: string) =>
        [...integrationsKeys.lists(), { countryCode }] as const,
    link: () => [...integrationsKeys.all, "link"] as const,
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
        `bank_integration/link`,
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
        queryKey: integrationsKeys.list(countryCode),
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
        mutationKey: integrationsKeys.link(),
    });
};

const updateRequisitionStatus = async (body: UpdateRequisitionStatusParams) => {
    const { error } = await supabase.functions.invoke(
        `bank_integration/status`,
        {
            method: "POST",
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
    return useMutation({
        mutationFn: async (body) => {
            await updateRequisitionStatus(body);
        },
        ...options,
    });
};
