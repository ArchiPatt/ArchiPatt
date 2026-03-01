import {instance} from "../../../app/api/instance.ts";
import type {UserProfileResponse} from "../types/UserProfileResponse.ts";

const userApi = {
    getPersonalProfile: async () => {
        const { data } = await instance.get<UserProfileResponse>('me')

        return data
    }
}

export { userApi }