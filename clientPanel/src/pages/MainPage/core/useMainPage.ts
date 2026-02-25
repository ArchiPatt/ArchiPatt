import {useLocation} from "react-router-dom";
import {authApi} from "../../../api";
import {useQuery} from "@tanstack/react-query";
import {tokenStorage} from "../../../app/storage/tokenStorage";
import {refreshStorage} from "../../../app/storage/refreshStorage";
import {useEffect} from "react";


const useMainPage = () => {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const { data, isLoading, error } = useQuery({
        queryKey: ['accessToken', code],
        queryFn: () => authApi.accessToken(code as string),
        enabled: !!code,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            tokenStorage.setItem(data.access_token);
            refreshStorage.setItem(data.refresh_token)
        }
    }, [data]);



    return { code, data, isLoading, error };
}

export { useMainPage }