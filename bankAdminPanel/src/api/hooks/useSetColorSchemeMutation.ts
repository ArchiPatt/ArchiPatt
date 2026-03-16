import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postAdminSettingsColorScheme } from '../../../generated/api/adminSettings'
import type { ColorScheme } from '../../../generated/api/adminSettings/types.gen'

export const useSetColorSchemeMutation = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (colorScheme: ColorScheme) => postAdminSettingsColorScheme({ body: { colorScheme } }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['colorScheme'] })
      }
   })
}
