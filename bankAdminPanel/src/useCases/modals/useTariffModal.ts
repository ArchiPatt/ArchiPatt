import { yupResolver } from '@hookform/resolvers/yup'
import { useCreateTariffMutation } from '../../api/hooks/useCreateTariffMutation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import type { ContextModalProps } from '@mantine/modals'

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

export const useTariffModal = ({ context, id }: Omit<ContextModalProps, 'innerProps'>) => {
   const createTariff = useCreateTariffMutation()
   const { handleSubmit, control, formState: {errors} } = useForm({
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

   return { state: { control, errors, createTariff }, functions: { onSubmit } }
}
