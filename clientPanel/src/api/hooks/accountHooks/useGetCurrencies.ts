import {useQuery} from "@tanstack/react-query";
import {accountsApi} from "../../requests/accountsApi.ts";
import type {CurrencyResponse} from "../../../../generated/api/customTypes/account/CurrencyResponse.ts";

const useGetCurrencies = () => {

    return useQuery<CurrencyResponse, Error, CurrencyResponse, ['currencies']>({
        queryKey: ['currencies'],
        queryFn: () => accountsApi.getCurrencies()
    })
}

export { useGetCurrencies }