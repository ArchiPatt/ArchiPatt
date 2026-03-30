import type {AxiosResponse} from "axios";
import type {ColorSchemeResponse} from "../../../generated/api/customTypes/settings/ColorSchemeResponse.ts";
import {instance} from "../network/instance.ts";
import type {SetColorSchemeRequest} from "../../../generated/api/customTypes/settings/SetColorSchemeRequest.ts";
import type {HiddenAccountsResponse} from "../../../generated/api/customTypes/settings/HiddenAccountsResponse.ts";
import type {AddHiddenAccountRequest} from "../../../generated/api/customTypes/settings/AddHiddenAccountRequest.ts";

/** Через gateway (4004) → те же метрики мониторинга, что и для остальных API */
const clientSettings = {
    getColorScheme: async () => {
        const response: AxiosResponse<ColorSchemeResponse> = await instance.get(
            "/client-settings/color-scheme",
        );

        return response.data;
    },
    setColorScheme: async (model: SetColorSchemeRequest) => {
        const response: AxiosResponse<ColorSchemeResponse> = await instance.post(
            "/client-settings/color-scheme",
            model,
        );

        return response.data;
    },
    getHiddenAccounts: async () => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.get(
            "/client-settings/hidden-accounts",
        );

        return response.data;
    },
    setHiddenAccount: async (model: AddHiddenAccountRequest) => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.post(
            "/client-settings/hidden-accounts",
            model,
        );

        return response.data;
    },
    deleteHiddenAccount: async (accountId: string) => {
        const response: AxiosResponse<HiddenAccountsResponse> = await instance.delete(
            `/client-settings/hidden-accounts/${accountId}`,
        );

        return response.data;
    },
};

export { clientSettings }