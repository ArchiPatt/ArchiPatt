import {instance} from "../../app/api/instance.ts";
import type {createAccountRequest} from "../../types/createAccountRequest.ts";

const accountsApi = {
    getAccountsList: async () => {
        const { data } = await instance.get("accounts");

        return data
    },
    getAccountById: async (id: string) => {
        const { data } = await instance.get(`accounts/${id}`);

        return data
    },
    getAccountTransactions: async (accountId: string) => {
        // Временно дефолтные сортировки
        const { data } = await instance.get(`accounts/${accountId}/operations?limit=20&offset=0&sort=desc`);

        return data
    },
    closeAccount: async (accountId: string) => {
        await instance.post(`accounts/${accountId}/close`)
    },
    openAccount: async (model: createAccountRequest) => {

        await instance.post("accounts", model);
    }
}

export { accountsApi }