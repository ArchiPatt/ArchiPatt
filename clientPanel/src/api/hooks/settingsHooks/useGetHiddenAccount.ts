import {useQuery} from "@tanstack/react-query";
import {clientSettings} from "../../requests/clientSettings.ts";

const useGetHiddenAccounts = () => {
    return useQuery({
        queryKey: ['hiddenAccounts'],
        queryFn: () => clientSettings.getHiddenAccounts()
    })
}

export { useGetHiddenAccounts }