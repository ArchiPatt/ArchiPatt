import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {AccountOperationsPage} from "../../../types/transaction/AccountOperationsPage.ts";
import type {Account} from "../../../types/account/Account.ts";

const useGetAccountById = (id: string | undefined) => {
    return useQuery<Account, Error, Account, ['account', string | undefined]>({
        queryKey: ['account', id],
        queryFn: () => accountsApi.getAccountById(id!),
        enabled: !!id,
    })
}

export { useGetAccountById }