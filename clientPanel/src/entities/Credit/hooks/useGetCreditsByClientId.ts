import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";
import {userStorage} from "../../../app/storage/userStorage";
import type {CreditResponse} from "../types/CreditResponse.ts";

const useGetCreditsByClientId = (id: string) => {
    return useQuery<CreditResponse[], Error, CreditResponse[], ['creditList', string | null]>({
        queryKey: ['creditList', userStorage.getItem()],
        queryFn: () => creditsApi.getCreditsByClientId(id)
    })
}

export { useGetCreditsByClientId }