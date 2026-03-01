import type {Account} from "../types/Account.ts";
import type {CreateAccountRequest} from "../types/CreateAccountRequest.ts";
import type {DepositWithdrawRequest} from "../types/DepositWithdrawRequest.ts";
import {instance} from "../../../app/api/instance.ts";

const accountsApi = {
    getAccountsList: async () => {
        const { data } = await instance.get<Account[]>("accounts");

        return data
    },
    createAccount: async (model: CreateAccountRequest) => {
        await instance.post("accounts", model)
    },
    getAccountById: async (id: string) => {
        const { data } = await instance.get<Account>(`accounts/${id}`)

        return data
    },
    closeAccount: async (id: string) => {
        await instance.post(`accounts/${id}/close`)
    },
    depositAccount: async (model: DepositWithdrawRequest, id: string) => {
        await instance.post(`accounts/${id}/deposit`, model);
    },
    withdrawAccount: async (model: DepositWithdrawRequest, id: string) => {
        await instance.post(`accounts/${id}/withdraw`, model)
    },
}

export { accountsApi }