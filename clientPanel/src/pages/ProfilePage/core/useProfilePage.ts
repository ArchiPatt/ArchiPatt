import {useEffect, useState} from "react";
import type {userProfileResponse} from "../../../types/userProfileResponse.ts";
import {useGetPersonalProfile} from "../../../entities/User";

const useProfilePage = () => {

    const { data: userData } = useGetPersonalProfile()

    const [profileData, setProfileData] = useState<userProfileResponse>({ id: '', username: '', roles: [], displayName: "", isBlocked: false })

    useEffect(() => {
        if (userData) {
            setProfileData(userData)
        }
    }, [userData]);

    return { profileData }
}

export { useProfilePage }