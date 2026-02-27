import {useQuery} from "@tanstack/react-query";
import {creditsApi} from "../api/creditApi.ts";

const useGetCreditById = (id: string) => {
    return useQuery({
        queryKey: ['credit'],
        queryFn: () => creditsApi.getCreditById(id)
    })
}

export { useGetCreditById }