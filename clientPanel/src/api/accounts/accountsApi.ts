import {instance} from "../../app/api/instance.ts";

const accountsApi = {
    accountsList: async () => {
        const { data } = await instance.get("accounts");

        return data
    }
}

export { accountsApi }