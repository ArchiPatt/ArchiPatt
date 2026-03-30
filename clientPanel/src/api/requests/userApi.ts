import {instance} from "../network/instance.ts";
import type {UserProfileResponse} from "../../../generated/api/userHooks";

const userApi = {
    getPersonalProfile: async () => {
        const { data } = await instance.get<UserProfileResponse>('me')

        return data
    }
}

export { userApi }