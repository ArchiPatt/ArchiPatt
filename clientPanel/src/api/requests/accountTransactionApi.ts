import {instance} from "../network/instance.ts";
import type {AccountOperationsPage} from "../../types/transaction/AccountOperationsPage.ts";
import type {AccountTransactionRequest} from "../../types/transaction/accountTransactionRequest.ts";

const accountTransactionApi = {
    getAccountTransactions: async (params: AccountTransactionRequest) => {
        const searchParams = new URLSearchParams();
        if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
        if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
        if (params.sort !== undefined) searchParams.set('sort', params.sort);
        const query = searchParams.toString();
        const url = `accounts/${params.id}/operations${query ? `?${query}` : ''}`;
        const { data } = await instance.get<AccountOperationsPage>(url);
        return data;
    }
}

export { accountTransactionApi }