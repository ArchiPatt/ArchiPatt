import {useQuery} from "@tanstack/react-query";
import {creditTransactionApi} from "../api/creditTransactionApi.ts";

const useGetCreditTransactions = (id: string) => {
    return useQuery({
        queryKey: ['creditTransactions'],
        queryFn: () => creditTransactionApi.getCreditTransactions(id)
    })
}

export { useGetCreditTransactions }