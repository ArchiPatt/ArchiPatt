import {useQuery} from "@tanstack/react-query";
import {accountTransactionApi} from "../api/accountTransactionApi.ts";
import type {AccountTransactionRequest} from "../types/accountTransactionRequest.ts";
import type {AccountOperationsPage} from "../types/AccountOperationsPage.ts";
import type {Account} from "../../Account/types/Account.ts";

const useGetAccountTransactions = (model: AccountTransactionRequest) => {
    return useQuery<AccountOperationsPage, Error, AccountOperationsPage, ['accountTransactions', AccountTransactionRequest | null]>({
        queryKey: ['accountTransactions', model],
        queryFn: () => accountTransactionApi.getAccountTransactions(model)
    })
}

export { useGetAccountTransactions }