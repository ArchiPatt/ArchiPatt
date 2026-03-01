import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";
import type {CreditResponse} from "../types/CreditResponse.ts";

const useGetCreditById = (id: string | undefined) => {
    return useQuery<CreditResponse, Error, CreditResponse, ['credit', string | undefined]>({
        queryKey: ['credit', id],
        queryFn: () => creditsApi.getCreditById(id!),
        enabled: !!id,
    })
}

export { useGetCreditById }