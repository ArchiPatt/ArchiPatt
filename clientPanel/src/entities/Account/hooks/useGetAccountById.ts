import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";
import type {AccountOperationsPage} from "../../Transaction/types/AccountOperationsPage.ts";
import type {Account} from "../types/Account.ts";

const useGetAccountById = (id: string | undefined) => {
    return useQuery<Account, Error, Account, ['account', string | undefined]>({
        queryKey: ['account', id],
        queryFn: () => accountsApi.getAccountById(id!),
        enabled: !!id,
    })
}

export { useGetAccountById }