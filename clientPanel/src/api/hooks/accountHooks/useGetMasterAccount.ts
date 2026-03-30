import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {Account} from "../../../../generated/api/core";

const useGetMasterAccount = () => {

    return useQuery<Account, Error, Account, ['masterAccount']>({
        queryKey: ['masterAccount'],
        queryFn: () => accountsApi.getMasterAccount()
    })
}

export { useGetMasterAccount }