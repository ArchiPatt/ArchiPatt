import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import {userStorage} from "../../../shared/storage/userStorage";
import type {Account} from "../../../types/account/Account.ts";
import type {CurrencyResponse} from "../../../types/account/CurrencyResponse.ts";

const useGetCurrencies = () => {

    return useQuery<CurrencyResponse, Error, CurrencyResponse, ['currencies', string]>({
        queryKey: ['currencies'],
        queryFn: () => accountsApi.getCurrencies()
    })
}

export { useGetCurrencies }