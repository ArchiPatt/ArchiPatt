import {useGetPersonalProfile} from "../../api/hooks/userHooks/useGetPersonalProfile.ts";
import {useGetCreditRatingByUserId} from "../../api/hooks/creditHooks/useGetCreditRatingByUserId.ts";
import {userStorage} from "../../shared/storage/userStorage";

const useProfilePage = () => {

    const userId = userStorage.getItem()

    const { data: userData, isLoading } = useGetPersonalProfile()
    const { data: creditRating, isLoading: creditLoading } = useGetCreditRatingByUserId(userId)

    return { userData, isLoading, creditRating, creditLoading }
}

export { useProfilePage }