import {instance} from "../../app/api/instance.ts";
import type {accessTokenRequest} from "../../types/accessTokenRequest.ts";
import type {refreshTokenRequest} from "../../types/refreshTokenRequest.ts";

const authApi = {
    accessToken: async (token: string) => {
        const model: accessTokenRequest = {
            grant_type: "authorization_code",
            code: token
        }
        const { data } = await instance.post("token", model);

        return data
    },
    refreshToken: async (token: string) => {
        const model: refreshTokenRequest = {
            grant_type: "refresh_token",
            refresh_token: token
        }
        const { data } = await instance.post("token", model);

        return data
    }
}

export { authApi }