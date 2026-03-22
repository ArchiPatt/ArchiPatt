import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../../requests/creditApi.ts";
import type {CreditResponse} from "../../../types/credit/CreditResponse.ts";
import type {CreditRating} from "../../../types/credit/CreditRating.ts";

const useGetCreditRatingByUserId = (id: string | null) => {
    return useQuery<CreditRating, Error, CreditRating, ['creditRating', string | null]>({
        queryKey: ['creditRating', id],
        queryFn: () => creditsApi.getCreditRatingByUserId(id!),
        enabled: !!id,
    })
}

export { useGetCreditRatingByUserId }