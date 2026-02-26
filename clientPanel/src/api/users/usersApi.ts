import {instance} from "../../app/api/instance.ts";

const userApi = {
    me: async () => {
        const { data } = await instance.get("me")
        return data
    }
}

export { userApi }