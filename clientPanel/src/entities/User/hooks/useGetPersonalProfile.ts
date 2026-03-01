import {useQuery} from "@tanstack/react-query";
import {userApi} from "../api/userApi.ts";
import {tokenStorage} from "../../../app/storage/tokenStorage";

const useGetPersonalProfile = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => userApi.getPersonalProfile(),
        enabled: !!tokenStorage.getItem(),
    })
}

export { useGetPersonalProfile }