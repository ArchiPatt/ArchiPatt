import {instance} from "../network/instance.ts";
import type {AxiosResponse} from "axios";
import type {
    CreditResponse,
    IssueCreditRequest,
    RepayCreditRequest,
    RepayCreditResponse
} from "../../../generated/api/credits";
import type {CreditRating} from "../../../generated/api/core";

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
    getCreditRatingByUserId: async (userId: string) => {
        const response: AxiosResponse<CreditRating> = await instance.get(`credits/rating/${userId}`)

        return response.data
    }
}

export { creditsApi }