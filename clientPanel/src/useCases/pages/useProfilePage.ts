import {useGetPersonalProfile} from "../../request/user";

const useProfilePage = () => {

    const { data: userData, isLoading } = useGetPersonalProfile()

    return { userData, isLoading }
}

export { useProfilePage }