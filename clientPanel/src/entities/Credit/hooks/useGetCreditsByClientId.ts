import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";
import {userStorage} from "../../../app/storage/userStorage";

const useGetCreditsByClientId = (id: string) => {
    return useQuery({
        queryKey: ['creditList', userStorage.getItem()],
        queryFn: () => creditsApi.getCreditsByClientId(id)
    })
}

export { useGetCreditsByClientId }