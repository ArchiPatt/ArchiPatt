import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";
import type {AccountOperationsPage} from "../../Transaction/types/AccountOperationsPage.ts";
import type {AccountTransactionRequest} from "../../Transaction/types/accountTransactionRequest.ts";
import type {CreditResponse} from "../types/CreditResponse.ts";

const useGetCreditById = (id: string) => {
    return useQuery<CreditResponse, Error, CreditResponse, ['credit']>({
        queryKey: ['credit'],
        queryFn: () => creditsApi.getCreditById(id)
    })
}

export { useGetCreditById }