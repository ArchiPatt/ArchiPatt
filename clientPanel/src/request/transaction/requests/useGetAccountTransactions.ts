import {useQuery} from "@tanstack/react-query";
import {accountTransactionApi} from "../../../api/repository/accountTransactionApi.ts";
import type {AccountTransactionRequest} from "../../../types/transaction/accountTransactionRequest.ts";
import type {AccountOperationsPage} from "../../../types/transaction/AccountOperationsPage.ts";
import type {Account} from "../../../types/account/Account.ts";

const useGetAccountTransactions = (model: AccountTransactionRequest) => {
    return useQuery<AccountOperationsPage, Error, AccountOperationsPage, ['accountTransactions', AccountTransactionRequest | null]>({
        queryKey: ['accountTransactions', model],
        queryFn: () => accountTransactionApi.getAccountTransactions(model),
        enabled: !!model.id,
    })
}

export { useGetAccountTransactions }