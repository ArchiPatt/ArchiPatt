import type {IssueCreditRequest} from "../../types/credit/IssueCreditRequest.ts";
import type {CreditResponse} from "../../types/credit/CreditResponse.ts";
import type {RepayCreditRequest} from "../../types/credit/RepayCreditRequest.ts";
import type {RepayCreditResponse} from "../../types/credit/RepayCreditResponse.ts";
import {instance} from "../network/instance.ts";

const creditsApi = {
    createCredit: async (model: IssueCreditRequest) => {
        const { data } = await instance.post<CreditResponse>("credits/issue", model)

        return data
    },
    getCreditById: async (id: string) => {
        const { data } = await instance.get<CreditResponse>(`credits/${id}`);

        return data
    },
    creditRepay: async (model: RepayCreditRequest, id: string) => {
        const { data } = await instance.post<RepayCreditResponse>(`credits/${id}/repay`, model)

        return data
    },
    getCreditsByClientId: async (id: string) => {
        const { data } = await instance.get<CreditResponse[]>(`credits/by-client/${id}`)

        return data
    },
}

export { creditsApi }