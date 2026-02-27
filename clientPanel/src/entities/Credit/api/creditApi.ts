import type {IssueCreditRequest} from "../types/IssueCreditRequest.ts";
import type {CreditResponse} from "../types/CreditResponse.ts";
import type {RepayCreditRequest} from "../types/RepayCreditRequest.ts";
import type {RepayCreditResponse} from "../types/RepayCreditResponse.ts";
import {instance} from "../../../app/api/instance.ts";

const creditsApi = {
    createCredit: async (model: IssueCreditRequest) => {
        const { data } = instance.post<CreditResponse>("credits/issue", model)

        return data
    },
    getCreditById: async (id: string) => {
        const { data } = instance.get<CreditResponse>(`credits/${id}`);

        return data
    },
    creditRepay: async (model: RepayCreditRequest, id: string) => {
        const { data } = instance.post<RepayCreditResponse>(`credits/${id}/repay`, model)

        return data
    },
    getCreditsByClientId: async (id: string) => {
        const { data } = instance.get<CreditResponse[]>(`credits/by-client/${id}`)

        return data
    },
}

export { creditsApi }