import { Button, Group, NumberInput, Stack, TextInput } from '@mantine/core'
import type { ContextModalProps } from '@mantine/modals'
import { Controller } from 'react-hook-form'

import { useTariffModal } from '../../../useCases/modals/useTariffModal'

export const CreateTariffModal = ({ context, id }: ContextModalProps) => {
   const { state, functions } = useTariffModal({ context, id })

   return (
      <form onSubmit={functions.onSubmit}>
         <Stack gap="md">
            <Controller
               name="name"
               control={state.control}
               render={({ field }) => (
                  <TextInput
                     label="Название тарифа"
                     placeholder="Введите название"
                     withAsterisk
                     {...field}
                     error={state.errors.name?.message}
                  />
               )}
            />

            <Controller
               name="interestRatePercent"
               control={state.control}
               render={({ field }) => (
                  <NumberInput
                     label="Процентная ставка"
                     placeholder="Например, 1.5"
                     withAsterisk
                     decimalScale={2}
                     rightSection="%"
                     {...field}
                     error={state.errors.interestRatePercent?.message}
                  />
               )}
            />

            <Controller
               name="billingPeriodDays"
               control={state.control}
               render={({ field }) => (
                  <NumberInput
                     label="Период (в днях)"
                     placeholder="Например, 30"
                     allowNegative={false}
                     {...field}
                     error={state.errors.billingPeriodDays?.message}
                  />
               )}
            />

            <Group justify="flex-end" mt="md">
               <Button
                  variant="default"
                  onClick={() => context.closeModal(id)}
                  disabled={state.createTariff.isPending}
               >
                  Отмена
               </Button>
               <Button type="submit" loading={state.createTariff.isPending}>
                  Создать
               </Button>
            </Group>
         </Stack>
      </form>
   )
}
