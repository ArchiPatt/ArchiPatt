import {useQuery} from "@tanstack/react-query";
import type {TariffResponse} from "../../../types/tariff/TariffResponse.ts";
import {tariffApi} from "../../../api/repository/tariffApi.ts";

const useGetTariffList = () => {
    return useQuery<TariffResponse[], Error, TariffResponse[], ['tariff']>({
        queryKey: ['tariff'],
        queryFn: () => tariffApi.getTariffList()
    })
}

export { useGetTariffList }