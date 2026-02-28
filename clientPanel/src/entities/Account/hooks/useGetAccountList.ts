import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";
import {userStorage} from "../../../app/storage/userStorage";
import type {Account} from "../types/Account.ts";

const useGetAccountList = () => {

    return useQuery<Account[], Error, Account[], ['accountList', string | null]>({
        queryKey: ['accountList', userStorage.getItem()],
        queryFn: () => accountsApi.getAccountsList()
    })
}

export { useGetAccountList }