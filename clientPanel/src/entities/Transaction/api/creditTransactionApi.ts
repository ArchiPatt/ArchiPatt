import {instance} from "../../../app/api/instance.ts";
import type {CreditPaymentResponse} from "../types/CreditPaymentResponse.ts";

const creditTransactionApi = {
    getCreditTransactions: async (id: string) => {
        const { data } = instance.get<CreditPaymentResponse[]>(`credits/${id}`)

        return data
    }
}

export { creditTransactionApi }