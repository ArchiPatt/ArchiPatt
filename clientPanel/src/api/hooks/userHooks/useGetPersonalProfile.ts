import {useQuery} from "@tanstack/react-query";
import {userApi} from "../../requests/userApi.ts";
import {tokenStorage} from "../../../shared/storage/tokenStorage";

const useGetPersonalProfile = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => userApi.getPersonalProfile(),
        enabled: !!tokenStorage.getItem(),
    })
}

export { useGetPersonalProfile }