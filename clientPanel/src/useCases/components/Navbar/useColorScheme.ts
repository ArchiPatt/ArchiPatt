import { useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'
import type {ColorScheme} from "../../../types/settings/ColorScheme.ts";
import {useGetColorScheme} from "../../../api/hooks/settingsHooks/useGetColorShceme.ts";
import {useSetColorScheme} from "../../../api/hooks/settingsHooks/useSetColorScheme.ts";

const useColorScheme = () => {
    const { setColorScheme: setMantineColorScheme, colorScheme } = useMantineColorScheme()
    const { data, isSuccess } = useGetColorScheme()
    const { mutate: setServerColorScheme } = useSetColorScheme()

    useEffect(() => {
        if (isSuccess && data?.colorScheme) {
            setMantineColorScheme(data.colorScheme)
        }
    }, [isSuccess, data])

    const setColorScheme = (colorScheme: ColorScheme) => {
        setMantineColorScheme(colorScheme)
        setServerColorScheme(colorScheme)
    }

    return { setColorScheme, colorScheme }
}


export { useColorScheme }