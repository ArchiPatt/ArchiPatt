import {useLocation} from "react-router-dom";
import {userStorage} from "../../../app/storage/userStorage";
import {useEffect} from "react";
import {useGetPersonalProfile} from "../../../entities/User";
import {useGetAccountList} from "../../../entities/Account";
import {useGetCreditsByClientId} from "../../../entities/Credit";
import {useAccessToken} from "../../../entities/Auth";


const useMainPage = () => {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const { mutate: getAccessToken } = useAccessToken();

    const { data: userProfileData } = useGetPersonalProfile()
    const { data: accounts, isLoading: accountLoading, error: accountError } = useGetAccountList()
    const { data: credits, isLoading: creditLoading, error: creditError } = useGetCreditsByClientId(userStorage.getItem())

    useEffect(() => {
        getAccessToken(code ?? "")
    }, []);

    useEffect(() => {
        if(userProfileData) {
            userStorage.removeItem()
            userStorage.setItem(userProfileData.id)
        }
    }, [userProfileData]);

    return {
        accounts,
        credits,
        accountLoading,
        creditLoading,
        accountError,
        creditError
    }
}

export { useMainPage }