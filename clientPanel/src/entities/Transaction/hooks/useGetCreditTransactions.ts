import {useQuery} from "@tanstack/react-query";
import {creditTransactionApi} from "../api/creditTransactionApi.ts";
import type {AccountOperationsPage} from "../types/AccountOperationsPage.ts";
import type {AccountTransactionRequest} from "../types/accountTransactionRequest.ts";
import type {CreditPaymentResponse} from "../types/CreditPaymentResponse.ts";

const useGetCreditTransactions = (id: string | undefined) => {
    return useQuery<CreditPaymentResponse[], Error, CreditPaymentResponse[], ['creditTransactions', string | undefined]>({
        queryKey: ['creditTransactions', id],
        queryFn: () => creditTransactionApi.getCreditTransactions(id!),
        enabled: !!id,
    })
}

export { useGetCreditTransactions }