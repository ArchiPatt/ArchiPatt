import {instance} from "../../../app/api/instance.ts";
import type {AccessTokenRequest} from "../types/AccessTokenRequest.ts";
import type {RefreshTokenRequest} from "../types/RefreshTokenRequest.ts";
import type {TokenResponse} from "../types/TokenResponse.ts";

const authApi = {
    accessToken: async (token: string) => {
        const params = new URLSearchParams();
        params.set('grant_type', 'authorization_code');
        params.set('code', token);

        const { data } = await instance.post<TokenResponse>("token", params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return data
    },
    refreshToken: async (token: string) => {
        const params = new URLSearchParams();
        params.set('grant_type', 'refresh_token');
        params.set('refresh_token', token);

        const { data } = await instance.post<TokenResponse>("token", params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return data
    },
    logout: async () => {
        await instance.post("logout");
    }
}

export { authApi }