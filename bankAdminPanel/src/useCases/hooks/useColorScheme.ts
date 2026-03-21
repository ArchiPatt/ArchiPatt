import { useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'
import { useColorSchemeQuery } from '../../api/hooks/useColorSchemeQuery'
import { useSetColorSchemeMutation } from '../../api/hooks/useSetColorSchemeMutation'
import type { ColorScheme } from '../../../generated/api/adminSettings'

export const useColorScheme = () => {
   const { setColorScheme: setMantineColorScheme, colorScheme } = useMantineColorScheme()
   const { data, isSuccess } = useColorSchemeQuery()
   const { mutate: setServerColorScheme } = useSetColorSchemeMutation()

   useEffect(() => {
      if (isSuccess && data?.data?.colorScheme) {
         setMantineColorScheme(data.data.colorScheme)
      }
   }, [isSuccess, data])

   const setColorScheme = (colorScheme: ColorScheme) => {
      setMantineColorScheme(colorScheme)
      setServerColorScheme(colorScheme)
   }

   return { setColorScheme, colorScheme }
}
