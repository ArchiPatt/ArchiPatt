import {instance} from "../../../app/api/instance.ts";
import type {AccessTokenRequest} from "../types/AccessTokenRequest.ts";
import type {RefreshTokenRequest} from "../types/RefreshTokenRequest.ts";
import type {TokenResponse} from "../types/TokenResponse.ts";

const authApi = {
    accessToken: async (token: string) => {
        const model: AccessTokenRequest = {
            grant_type: "authorization_code",
            code: token
        }

        const { data } = await instance.post<TokenResponse>("token", model);

        return data
    },
    refreshToken: async (token: string) => {
        const model: RefreshTokenRequest = {
            grant_type: "refresh_token",
            refresh_token: token
        }
        const { data } = await instance.post<TokenResponse>("token", model);

        return data
    }
}

export { authApi }