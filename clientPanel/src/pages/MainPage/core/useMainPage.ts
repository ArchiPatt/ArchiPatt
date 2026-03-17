import {useLocation} from "react-router-dom";
import {userStorage} from "../../../app/storage/userStorage";
import {useEffect} from "react";
import {useGetPersonalProfile} from "../../../entities/User";
import {useCreateAccount, useGetAccountList} from "../../../entities/Account";
import {useGetCreditsByClientId} from "../../../entities/Credit";
import {useAccessToken} from "../../../entities/Auth";
import type {CreateAccountRequest} from "../../../entities/Account/types/CreateAccountRequest.ts";
import {useGetTariffList} from "../../../entities/Tariff";


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
        if (code) {
            getAccessToken(code);
        }
    }, [code]);

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