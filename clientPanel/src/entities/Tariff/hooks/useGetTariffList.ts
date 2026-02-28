import {useQuery} from "@tanstack/react-query";
import type {TariffResponse} from "../types/TariffResponse.ts";
import {tariffApi} from "../api/tariffApi.ts";

const useGetTariffList = () => {
    return useQuery<TariffResponse[], Error, TariffResponse[], ['tariff']>({
        queryKey: ['tariff'],
        queryFn: () => tariffApi.getTariffList()
    })
}

export { useGetTariffList }