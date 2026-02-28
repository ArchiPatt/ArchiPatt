import {instance} from "../../../app/api/instance.ts";
import type {AccountOperationsPage} from "../types/AccountOperationsPage.ts";
import type {AccountTransactionRequest} from "../types/accountTransactionRequest.ts";

const accountTransactionApi = {
    getAccountTransactions: async (params: AccountTransactionRequest) => {
        const { data } = await instance.get<AccountOperationsPage>(
            `accounts/${params.id}/operations${params.limit !== undefined || params.offset !== undefined || params.sort !== undefined ? "?" : ''}`)

        return data
    }
}

export { accountTransactionApi }