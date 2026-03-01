import {useQuery} from "@tanstack/react-query";
import type {TariffResponse} from "../types/TariffResponse.ts";
import {tariffApi} from "../api/tariffApi.ts";

const useGetTariffById = (id: string | undefined) => {
    return useQuery<TariffResponse, Error, TariffResponse, ['tariff', string | undefined]>({
        queryKey: ['tariff', id],
        queryFn: () => tariffApi.getTariffById(id!),
        enabled: !!id,
    })
}

export { useGetTariffById }