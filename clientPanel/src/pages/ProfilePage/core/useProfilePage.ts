import type {userProfileResponse} from "../../../types/userProfileResponse.ts";

const useProfilePage = (props: userProfileResponse) => {
    const {
        id,
        username,
        displayName,
        roles,
        isBlocked
    } = props

    return {
        id,
        username,
        displayName,
        roles,
        isBlocked
    }
}

export { useProfilePage }