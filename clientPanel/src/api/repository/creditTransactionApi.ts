import {instance} from "../network/instance.ts";
import type {CreditPaymentResponse} from "../../types/transaction/CreditPaymentResponse.ts";

const creditTransactionApi = {
    getCreditTransactions: async (id: string) => {
        const { data } = await instance.get<CreditPaymentResponse[]>(`credits/${id}/payments`)

        return data
    }
}

export { creditTransactionApi }