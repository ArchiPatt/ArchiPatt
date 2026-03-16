import {useLocation} from "react-router-dom";
import {userStorage} from "../../shared/storage/userStorage";
import {useEffect} from "react";
import {useGetPersonalProfile} from "../../request/user";
import {useCreateAccount, useGetAccountList} from "../../request/account";
import {useGetCreditsByClientId} from "../../request/credit";
import {useAccessToken} from "../../request/auth";
import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import {useGetTariffList} from "../../request/tariff";


const useMainPage = () => {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const { mutate: getAccessToken } = useAccessToken();
    const { mutate: newAccount } = useCreateAccount();

    const { data: userProfileData } = useGetPersonalProfile()
    const { data: accounts, isLoading: accountLoading, error: accountError } = useGetAccountList()
    const { data: credits, isLoading: creditLoading, error: creditError } = useGetCreditsByClientId(userStorage.getItem())
    const { data: tariffs, isLoading: tariffsLoading, error: tariffError } = useGetTariffList()

    const createAccount = () => {
        const model: CreateAccountRequest = {
            clientId: userStorage.getItem()
        }
        newAccount(model)
    }

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
        accountLoading,
        accountError,
        credits,
        creditLoading,
        creditError,
        tariffs,
        tariffsLoading,
        tariffError,
        createAccount,
    }
}

export { useMainPage }