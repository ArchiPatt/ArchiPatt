import {useQuery} from "@tanstack/react-query";
import type {TariffResponse} from "../types/TariffResponse.ts";
import {tariffApi} from "../api/tariffApi.ts";

const useGetTariffById = (id: string) => {
    return useQuery<TariffResponse, Error, TariffResponse, ['tariff', string | null]>({
        queryKey: ['tariff', id],
        queryFn: () => tariffApi.getTariffById(id)
    })
}

export { useGetTariffById }