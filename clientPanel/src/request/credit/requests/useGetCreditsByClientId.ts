import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../../../api/repository/creditApi.ts";
import type {CreditResponse} from "../../../types/credit/CreditResponse.ts";

const useGetCreditsByClientId = (id: string | null) => {
    return useQuery<CreditResponse[], Error, CreditResponse[], ['creditList', string | null]>({
        queryKey: ['creditList', id],
        queryFn: () => creditsApi.getCreditsByClientId(id!),
        enabled: !!id,
    })
}

export { useGetCreditsByClientId }