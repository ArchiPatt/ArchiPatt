import {useQuery} from "@tanstack/react-query";
import {creditTransactionApi} from "../../requests/creditTransactionApi.ts";
import type {CreditPaymentResponse} from "../../../types/transaction/CreditPaymentResponse.ts";

const useGetCreditTransactions = (id: string | undefined) => {
    return useQuery<CreditPaymentResponse[], Error, CreditPaymentResponse[], ['creditTransactions', string | undefined]>({
        queryKey: ['creditTransactions', id],
        queryFn: () => creditTransactionApi.getCreditTransactions(id!),
        enabled: !!id,
    })
}

export { useGetCreditTransactions }