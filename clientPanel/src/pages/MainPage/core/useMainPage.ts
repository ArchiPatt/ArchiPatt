import {useLocation} from "react-router-dom";
import {accountsApi, authApi, userApi} from "../../../api";
import {useQuery} from "@tanstack/react-query";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {userStorage} from "../../../app/storage/userStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";
import {useEffect, useState} from "react";
import type {account} from "../../../types/account.ts";
import type {creditResponse} from "../../../types/creditResponse.ts";
import {creditsApi} from "../../../api/credits/creditsApi.ts";


const useMainPage = () => {

    const [accounts, setAccounts] = useState<account[]>([]);
    const [credits, setCredits] = useState<creditResponse[]>([])

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const { data: tokens } = useQuery({
        queryKey: ['accessToken', code],
        queryFn: () => authApi.accessToken(code as string),
        enabled: !!code,
        retry: false,
    });

    const { data: userData } = useQuery({
        queryKey: ['userProfile', tokenStorage.getItem()],
        queryFn: async () => userApi.me(),
        enabled: !!tokenStorage.getItem(),
        retry: false,
    });

    const { data: accountData } = useQuery({
        queryKey: ['accountsData'],
        queryFn: () => accountsApi.getAccountsList(),
        enabled: !!userStorage.getItem(),
        retry: false,
    })

    const { data: creditData } = useQuery({
        queryKey: ['creditsData'],
        queryFn: () => creditsApi.getCreditsListByClientId (userStorage.getItem()),
        enabled: !!userStorage.getItem(),
        retry: false,
    })

    // пока эффекты используем
    useEffect(() => {
        if (tokens) {
            tokenStorage.removeItem()
            refreshStorage.removeItem()

            tokenStorage.setItem(tokens.access_token)
            refreshStorage.setItem(tokens.refresh_token)
        }
    }, [tokens]);

    useEffect(() => {
        if (userData) {
            userStorage.removeItem()

            userStorage.setItem(userData.id)
        }
    }, [userData]);

    useEffect(() => {
        if (accountData) {
            setAccounts([...accountData])
        }
    }, [accountData])

    useEffect(() => {
        if (creditData) {
            setCredits([...creditData])
        }
    }, [creditData]);

    return { accounts, credits };
}

export { useMainPage }