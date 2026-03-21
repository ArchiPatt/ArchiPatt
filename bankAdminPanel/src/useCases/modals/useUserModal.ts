import { useForm } from 'react-hook-form'
import { useCreateUserMutation } from '../../api/hooks/useCreateUserMutation'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
   username: yup.string().required('Логин обязателен').min(3, 'Минимум 3 символа'),
   displayName: yup.string().optional(),
   roles: yup
      .array()
      .of(yup.string())
      .required('Выберите хотя бы одну роль')
      .min(1, 'Выберите хотя бы одну роль')
})

export const useUserModal = () => {
   const createUser = useCreateUserMutation()
   const {
      control,
      handleSubmit,
      formState: { errors }
   } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
         username: '',
         displayName: '',
         roles: ['client']
      }
   })

   const onSubmit = handleSubmit((values) => {
      createUser.mutate({
         username: values.username,
         displayName: values.displayName || null,
         roles: values.roles as string[]
      })
   })

   return { state: { control, errors, createUser }, functions: { onSubmit } }
}
