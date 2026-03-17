import {useGetPersonalProfile} from "../../api/hooks/userHooks/useGetPersonalProfile.ts";

const useProfilePage = () => {

    const { data: userData, isLoading } = useGetPersonalProfile()

    return { userData, isLoading }
}

export { useProfilePage }