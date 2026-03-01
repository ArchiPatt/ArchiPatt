import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";
import {userStorage} from "../../../app/storage/userStorage";
import type {Account} from "../types/Account.ts";

const useGetAccountList = () => {

    const userId = userStorage.getItem();
    return useQuery<Account[], Error, Account[], ['accountList', string | null]>({
        queryKey: ['accountList', userId],
        queryFn: () => accountsApi.getAccountsList(),
        enabled: !!userId,
    })
}

export { useGetAccountList }