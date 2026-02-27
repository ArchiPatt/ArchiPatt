import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";
import {userStorage} from "../../../app/storage/userStorage";

const useGetAccountList = () => {

    return useQuery({
        queryKey: ['accountList', userStorage.getItem()],
        queryFn: () => accountsApi.getAccountsList()
    })
}

export { useGetAccountList }