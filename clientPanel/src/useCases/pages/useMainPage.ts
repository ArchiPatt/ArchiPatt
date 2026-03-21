import {useLocation} from "react-router-dom";
import {userStorage} from "../../shared/storage/userStorage";
import {useEffect, useMemo, useState} from "react";
import type {CreateAccountRequest} from "../../types/account/CreateAccountRequest.ts";
import {useAccessToken} from "../../api/hooks/authHooks/useAccessToken.ts";
import {useCreateAccount} from "../../api/hooks/accountHooks/useCreateAccount.ts";
import {useGetPersonalProfile} from "../../api/hooks/userHooks/useGetPersonalProfile.ts";
import {useGetAccountList} from "../../api/hooks/accountHooks/useGetAccountList.ts";
import {useGetCreditsByClientId} from "../../api/hooks/creditHooks/useGetCreditsByClientId.ts";
import {useGetTariffList} from "../../api/hooks/tariffHooks/useGetTariffList.ts";
import type {Account} from "../../types/account/Account.ts";
import {MASTER_ACCOUNT_ID} from "../../shared/constants/MASTER_ACCOUNT_ID.ts";


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