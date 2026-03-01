import {instance} from "../../../app/api/instance.ts";
import type {TariffResponse} from "../types/TariffResponse.ts";

const tariffApi = {
    getTariffList: async () => {
        const { data } = await instance.get<TariffResponse[]>("tariffs")

        return data
    },
    getTariffById: async (id: string) => {
        const { data } = await instance.get<TariffResponse>(`tariffs/${id}`)

        return data
    }
}

export { tariffApi };