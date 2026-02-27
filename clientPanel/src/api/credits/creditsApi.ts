import {instance} from "../../app/api/instance.ts";

const creditsApi = {
    getCreditsListByClientId: async (userId: string) => {
        const { data } = await instance.get(`credits/by-client/${userId}`);

        return data;
    },
    getTariffList: async () => {
        const { data } = await instance.get('tariffs')

        return data
    },
    getTariffById: async (tariffId: string) => {
        const { data } = await instance.get(`tariffs/${tariffId}`);

        return data
    }
}

export { creditsApi }