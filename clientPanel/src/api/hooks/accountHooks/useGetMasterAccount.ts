import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {Account} from "../../../types/account/Account.ts";

const useGetMasterAccount = () => {

    return useQuery<Account, Error, Account, ['masterAccount']>({
        queryKey: ['masterAccount'],
        queryFn: () => accountsApi.getMasterAccount()
    })
}

export { useGetMasterAccount }