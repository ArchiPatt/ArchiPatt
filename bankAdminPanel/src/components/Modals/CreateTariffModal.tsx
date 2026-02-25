import { Button, Group, NumberInput, Stack, TextInput } from '@mantine/core'
import type { ContextModalProps } from '@mantine/modals'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCreateTariffMutation } from '../../api/hooks/useCreateTariffMutation'

const schema = yup.object({
   name: yup.string().required('Название тарифа обязательно'),
   interestRatePercent: yup
      .number()
      .typeError('Введите число')
      .positive('Ставка должна быть больше 0')
      .required('Ставка обязательна'),
   billingPeriodDays: yup
      .number()
      .typeError('Введите число')
      .positive('Период должен быть больше 0')
      .integer('Период должен быть целым числом')
      .optional()
})

export const CreateTariffModal = ({ context, id }: ContextModalProps) => {
   const createTariff = useCreateTariffMutation()
   const {
      control,
      handleSubmit,
      formState: { errors }
   } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
         name: '',
         interestRatePercent: 1.5,
         billingPeriodDays: 30
      }
   })

   const onSubmit = handleSubmit((values) => {
      createTariff.mutate(
         {
            name: values.name,
            interestRate: values.interestRatePercent / 100,
            billingPeriodDays: values.billingPeriodDays ?? undefined
         },
         {
            onSuccess: () => {
               context.closeModal(id)
            }
         }
      )
   })

   return (
      <form onSubmit={onSubmit}>
         <Stack gap="md">
            <Controller
               name="name"
               control={control}
               render={({ field }) => (
                  <TextInput
                     label="Название тарифа"
                     placeholder="Введите название"
                     withAsterisk
                     {...field}
                     error={errors.name?.message}
                  />
               )}
            />

            <Controller
               name="interestRatePercent"
               control={control}
               render={({ field }) => (
                  <NumberInput
                     label="Процентная ставка"
                     placeholder="Например, 1.5"
                     withAsterisk
                     decimalScale={2}
                     rightSection="%"
                     {...field}
                     error={errors.interestRatePercent?.message}
                  />
               )}
            />

            <Controller
               name="billingPeriodDays"
               control={control}
               render={({ field }) => (
                  <NumberInput
                     label="Период (в днях)"
                     placeholder="Например, 30"
                     allowNegative={false}
                     {...field}
                     error={errors.billingPeriodDays?.message}
                  />
               )}
            />

            <Group justify="flex-end" mt="md">
               <Button
                  variant="default"
                  onClick={() => context.closeModal(id)}
                  disabled={createTariff.isPending}
               >
                  Отмена
               </Button>
               <Button type="submit" loading={createTariff.isPending}>
                  Создать
               </Button>
            </Group>
         </Stack>
      </form>
   )
}
