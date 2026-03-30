import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../../requests/creditApi.ts";
import type {CreditRating} from "../../../../generated/api/core";

const useGetCreditRatingByUserId = (id: string | null) => {
    return useQuery<CreditRating, Error, CreditRating, ['creditRating', string | null]>({
        queryKey: ['creditRating', id],
        queryFn: () => creditsApi.getCreditRatingByUserId(id!),
        enabled: !!id,
    })
}

export { useGetCreditRatingByUserId }