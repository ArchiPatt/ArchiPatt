import {useQuery} from "@tanstack/react-query";
import {tariffApi} from "../../requests/tariffApi.ts";
import type {TariffResponse} from "../../../../generated/api/credits";

const useGetTariffList = () => {
    return useQuery<TariffResponse[], Error, TariffResponse[], ['tariff']>({
        queryKey: ['tariff'],
        queryFn: () => tariffApi.getTariffList()
    })
}

export { useGetTariffList }