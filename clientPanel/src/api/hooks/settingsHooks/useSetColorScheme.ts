import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {ColorScheme} from "../../../types/settings/ColorScheme.ts";
import {clientSettings} from "../../requests/clientSettings.ts";

const useSetColorScheme = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (colorScheme: ColorScheme) => clientSettings.setColorScheme(colorScheme),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colorScheme'] })
        }
    })
}

export { useSetColorScheme }