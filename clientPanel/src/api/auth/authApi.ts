import {instance} from "../../app/api/instance.ts";
import type {accessTokenRequest} from "../../types/accessTokenRequest.ts";

const authApi = {
    accessToken: async (token: string) => {
        const model: accessTokenRequest = {
            grant_type: "authorization_code",
            code: token
        }
        const { data } = await instance.post("token", JSON.stringify(model));

        return data
    }
}

export { authApi }