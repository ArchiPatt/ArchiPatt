import {instance} from "../../app/api/instance.ts";

const creditsApi = {
    getCreditsListByClientId: async (userId: string) => {
        const { data } = await instance.get(`credits/by-client/${userId}`);

        return data;
    }
}

export { creditsApi }