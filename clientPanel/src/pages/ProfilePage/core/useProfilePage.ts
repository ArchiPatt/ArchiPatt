import {useGetPersonalProfile} from "../../../entities/User";

const useProfilePage = () => {

    const { data: userData, isLoading } = useGetPersonalProfile()

    return { userData, isLoading }
}

export { useProfilePage }