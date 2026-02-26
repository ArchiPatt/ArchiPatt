import {useQuery} from "@tanstack/react-query";
import {userApi} from "../../../api";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {useEffect, useState} from "react";
import type {userProfileResponse} from "../../../types/userProfileResponse.ts";

const useProfilePage = () => {

    const { data: userData } = useQuery({
        queryKey: ['userProfile', tokenStorage.getItem()],
        queryFn: async () => userApi.me(),
        enabled: !!tokenStorage.getItem(),
        retry: false,
    });

    const [profileData, setProfileData] = useState<userProfileResponse>({ id: '', username: '', roles: [], displayName: "", isBlocked: false })

    useEffect(() => {
        if (userData) {
            setProfileData(userData)
        }
    }, [userData]);

    return { profileData }
}

export { useProfilePage }