import {useLocation} from "react-router-dom";
import {authApi} from "../../../api";
import {useQuery} from "@tanstack/react-query";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {userStorage} from "../../../app/storage/userStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";
import {useEffect} from "react";
import {useGetPersonalProfile} from "../../../entities/User";
import {useGetAccountList} from "../../../entities/Account";
import {useGetCreditsByClientId} from "../../../entities/Credit";


const useMainPage = () => {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const { data: tokens } = useQuery({
        queryKey: ['accessToken', code],
        queryFn: async () => await authApi.accessToken(code as string),
        enabled: !!code,
        retry: false,
    });

    // пока эффекты используем
    useEffect(() => {
        if (tokens) {
            tokenStorage.removeItem()
            refreshStorage.removeItem()

            tokenStorage.setItem(tokens.access_token)
            refreshStorage.setItem(tokens.refresh_token)
        }
    }, [tokens]);

    const { data: userProfileData } = useGetPersonalProfile()

    useEffect(() => {
        if(userProfileData) {
            userStorage.removeItem()
            userStorage.setItem(userProfileData.id)
        }
    }, [userProfileData]);

    const { data: accounts, isLoading: accountLoading } = useGetAccountList()
    const { data: credits, isLoading: creditLoading } = useGetCreditsByClientId(userStorage.getItem())

    return { accounts, credits, accountLoading, creditLoading }
}

export { useMainPage }