import {useQuery} from "@tanstack/react-query";
import {userApi} from "../api/userApi.ts";
import {userStorage} from "../../../app/storage/userStorage";

const useGetPersonalProfile = () => {
    return useQuery({
        queryKey: ['user', userStorage.getItem()],
        queryFn: () => userApi.getPersonalProfile()
    })
}

export { useGetPersonalProfile }