import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {Account} from "../../../../generated/api/core";

const useGetAccountById = (id: string | undefined) => {
    return useQuery<Account, Error, Account, ['account', string | undefined]>({
        queryKey: ['account', id],
        queryFn: () => accountsApi.getAccountById(id!),
        enabled: !!id,
    })
}

export { useGetAccountById }