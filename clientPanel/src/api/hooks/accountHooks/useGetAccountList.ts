import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {userStorage} from "../../../shared/storage/userStorage";
import type {Account} from "../../../../generated/api/core";

const useGetAccountList = () => {

    const userId = userStorage.getItem();
    return useQuery<Account[], Error, Account[], ['accountList', string | null]>({
        queryKey: ['accountList', userId],
        queryFn: () => accountsApi.getAccountsList(),
        enabled: !!userId,
    })
}

export { useGetAccountList }