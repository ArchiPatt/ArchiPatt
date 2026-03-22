import type {AxiosResponse} from "axios";
import type {ColorSchemeResponse} from "../../types/settings/ColorSchemeResponse.ts";
import {instance} from "../network/instance.ts";
import type {SetColorSchemeRequest} from "../../types/settings/SetColorSchemeRequest.ts";
import type {HiddenAccountsResponse} from "../../types/settings/HiddenAccountsResponse.ts";
import type {AddHiddenAccountRequest} from "../../types/settings/AddHiddenAccountRequest.ts";

const clientSettings = {
    getColorScheme: async () => {
        const response: AxiosResponse<ColorSchemeResponse> = await instance.get('http://localhost:4006/client-settings/color-scheme')

        return response.data
    },
    setColorScheme: async (model: SetColorSchemeRequest) => {
        const response: AxiosResponse<ColorSchemeResponse> = await instance.post('http://localhost:4006/client-settings/color-scheme', model)

        return response.data
    },
    getHiddenAccounts: async () => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.get('http://localhost:4006/client-settings/hidden-accounts\n')

        return response.data
    },
    setHiddenAccount: async (model: AddHiddenAccountRequest) => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.post('http://localhost:4006/client-settings/hidden-accounts', model)

        return response.data
    },
    deleteHiddenAccount: async (accountId: string) => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.delete(`http://localhost:4006/client-settings/hidden-accounts/${accountId}`)

        return response.data
    }
}

export { clientSettings }