import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { InstitutionDto } from "./types";

export const integrationsKeys = {
    all: ['integrations'] as const,
    lists: () => [...integrationsKeys.all, 'list'] as const,
    list: (countryCode: string) => [...integrationsKeys.lists(), { countryCode }] as const,
};

const getIntegrations = async (countryCode: string) => {
    const { data, error } = await supabase.functions.invoke(
        `bank_integration/institutions?country=${countryCode}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        },
    );

    if (error) {
        throw error
    }

    return data
}

export const useGetInstitutions = (countryCode: string) => {
    return useQuery<InstitutionDto[], Error>({
        queryKey: integrationsKeys.list(countryCode),
        queryFn: () => getIntegrations(countryCode),
    });
};
