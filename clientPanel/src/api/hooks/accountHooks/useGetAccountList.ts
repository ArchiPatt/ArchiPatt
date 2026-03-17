import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {userStorage} from "../../../shared/storage/userStorage";
import type {Account} from "../../../types/account/Account.ts";

const useGetAccountList = () => {

    const userId = userStorage.getItem();
    return useQuery<Account[], Error, Account[], ['accountList', string | null]>({
        queryKey: ['accountList', userId],
        queryFn: () => accountsApi.getAccountsList(),
        enabled: !!userId,
    })
}

export { useGetAccountList }