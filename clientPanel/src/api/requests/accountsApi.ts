import type {Account} from "../../types/account/Account.ts";
import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import type {DepositWithdrawRequest} from "../../types/account/DepositWithdrawRequest.ts";
import {instance} from "../network/instance.ts";
import type {TransferRequest} from "../../types/account/TransferRequest.ts";
import type {AxiosResponse} from "axios";
import type {CurrencyResponse} from "../../types/account/CurrencyResponse.ts";

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
    transferAccount: async (model: TransferRequest) => {
        await instance.post(`accounts/transfer`, model)
    },
    getCurrencies: async () => {
        const response: AxiosResponse<CurrencyResponse> = await instance.get('currencies')

        return response.data
    },
    getMasterAccount: async() => {
        const response: AxiosResponse<Account> = await instance.get('accounts/master')

        return response.data
    }
}

export { accountsApi }