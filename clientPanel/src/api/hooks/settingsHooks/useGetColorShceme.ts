import {useQuery} from "@tanstack/react-query";
import {clientSettings} from "../../requests/clientSettings.ts";

const useGetColorScheme = () => {
    return useQuery({
        queryKey: ['colorScheme'],
        queryFn: () => clientSettings.getColorScheme()
    })
}

export { useGetColorScheme }