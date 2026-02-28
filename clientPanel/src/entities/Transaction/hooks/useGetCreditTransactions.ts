import {useQuery} from "@tanstack/react-query";
import {creditTransactionApi} from "../api/creditTransactionApi.ts";
import type {AccountOperationsPage} from "../types/AccountOperationsPage.ts";
import type {AccountTransactionRequest} from "../types/accountTransactionRequest.ts";
import type {CreditPaymentResponse} from "../types/CreditPaymentResponse.ts";

const useGetCreditTransactions = (id: string) => {
    return useQuery<CreditPaymentResponse[], Error, CreditPaymentResponse[], ['creditTransactions', string | null]>({
        queryKey: ['creditTransactions', id],
        queryFn: () => creditTransactionApi.getCreditTransactions(id)
    })
}

export { useGetCreditTransactions }