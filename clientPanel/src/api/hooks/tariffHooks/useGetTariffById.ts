import {useQuery} from "@tanstack/react-query";
import {tariffApi} from "../../requests/tariffApi.ts";
import type {TariffResponse} from "../../../../generated/api/credits";

const useGetTariffById = (id: string | undefined) => {
    return useQuery<TariffResponse, Error, TariffResponse, ['tariff', string | undefined]>({
        queryKey: ['tariff', id],
        queryFn: () => tariffApi.getTariffById(id!),
        enabled: !!id,
    })
}

export { useGetTariffById }