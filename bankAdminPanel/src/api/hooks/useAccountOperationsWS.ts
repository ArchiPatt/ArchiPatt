import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import type { AccountOperation } from '../../../generated/api/core'
import { useQueryClient } from '@tanstack/react-query'
export const useAccountOperationsWS = (id: string) => {
   const [operations, setOperations] = useState<AccountOperation[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const queryClient = useQueryClient()

   useEffect(() => {
      const socket = new WebSocket(
         `ws://localhost:4003/ws/accounts/${id}/operations?authorization=Bearer ${Cookies.get('accessToken')}`
      )
      socket.onopen = () => {
         setIsLoading(false)
      }
      socket.onmessage = (event) => {
         const data = JSON.parse(event.data)
         if (data.type === 'snapshot' && Array.isArray(data.items)) {
            setOperations(data.items)
         }
         if (data.type === 'operation_added' && 'operation' in data) {
            setOperations((prev) => [data.operation, ...prev])
            queryClient.invalidateQueries({ queryKey: ['account'] })
         }
      }
      return () => {
         socket.close()
      }
   }, [])

   return { operations, isLoading }
}
