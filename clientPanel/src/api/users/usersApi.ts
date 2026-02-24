import {instance} from "../../app/api/instance.ts";

const userApi = {
    me: async () => {
        const result = await instance.get("me")
        return result
    }
}

export { userApi }