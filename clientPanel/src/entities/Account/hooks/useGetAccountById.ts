import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../api/accountsApi.ts";

const useGetAccountById = (id: string) => {

    return useQuery({
        queryKey: ['account'],
        queryFn: () => accountsApi.getAccountById(id)
    })
}

export { useGetAccountById }