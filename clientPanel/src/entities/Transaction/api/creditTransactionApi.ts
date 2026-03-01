import {instance} from "../../../app/api/instance.ts";
import type {CreditPaymentResponse} from "../types/CreditPaymentResponse.ts";

const creditTransactionApi = {
    getCreditTransactions: async (id: string) => {
        const { data } = await instance.get<CreditPaymentResponse[]>(`credits/${id}/payments`)

        return data
    }
}

export { creditTransactionApi }