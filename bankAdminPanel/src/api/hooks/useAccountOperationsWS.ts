import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import type { AccountOperation } from '../../../generated/api/core'
import { useQueryClient } from '@tanstack/react-query'

const GATEWAY_WS =
   (import.meta.env.VITE_GATEWAY_WS_URL as string | undefined)?.replace(/\/$/, '') ||
   'ws://localhost:4004'

export const useAccountOperationsWS = (id: string) => {
   const [operations, setOperations] = useState<AccountOperation[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const queryClient = useQueryClient()

   useEffect(() => {
      const token = Cookies.get('accessToken')
      const socket = new WebSocket(
         `${GATEWAY_WS}/ws/accounts/${id}/operations?authorization=${encodeURIComponent(`Bearer ${token ?? ''}`)}`
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
   }, [id, queryClient])

   return { operations, isLoading }
}
