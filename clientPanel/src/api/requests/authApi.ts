import {instance} from "../network/instance.ts";
import type {AccessTokenRequest} from "../../types/auth/AccessTokenRequest.ts";
import type {RefreshTokenRequest} from "../../types/auth/RefreshTokenRequest.ts";
import type {TokenResponse} from "../../types/auth/TokenResponse.ts";

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
    },
    logout: async () => {
        await instance.post("logout");
    }
}

export { authApi }