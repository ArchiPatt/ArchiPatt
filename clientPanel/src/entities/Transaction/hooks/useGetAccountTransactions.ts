import {useQuery} from "@tanstack/react-query";
import {accountTransactionApi} from "../api/accountTransactionApi.ts";

const useGetAccountTransactions = () => {
    return useQuery({
        queryKey: ['accountTransactions'],
        queryFn: () => accountTransactionApi
    })
}

export { useGetAccountTransactions }