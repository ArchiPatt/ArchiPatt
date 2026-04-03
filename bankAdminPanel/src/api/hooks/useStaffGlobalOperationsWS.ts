import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import type { AccountOperation } from '../../../generated/api/core'

const GATEWAY_WS =
   (import.meta.env.VITE_GATEWAY_WS_URL as string | undefined)?.replace(/\/$/, '') ||
   'ws://localhost:4004'

type WsMessage = {
   type: string
   items?: AccountOperation[]
   operation?: AccountOperation
}

/**
 * Операции по всем счетам в реальном времени (employee/admin), через шлюз → core.
 */
export function useStaffGlobalOperationsWS(enabled: boolean) {
   const [operations, setOperations] = useState<AccountOperation[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      if (!enabled) {
         setIsLoading(false)
         return
      }
      const token = Cookies.get('accessToken')
      if (!token) {
         setError('no_token')
         setIsLoading(false)
         return
      }

      const url = `${GATEWAY_WS}/ws/staff/operations?authorization=${encodeURIComponent(`Bearer ${token}`)}`
      const socket = new WebSocket(url)

      socket.onopen = () => setIsLoading(false)
      socket.onerror = () => {
         setError('ws')
         setIsLoading(false)
      }
      socket.onmessage = (event) => {
         let data: WsMessage
         try {
            data = JSON.parse(String(event.data)) as WsMessage
         } catch {
            return
         }
         if (data.type === 'snapshot') {
            setOperations(Array.isArray(data.items) ? data.items : [])
         }
         if (data.type === 'operation_added' && data.operation) {
            setOperations((prev) => [data.operation!, ...prev].slice(0, 200))
         }
      }

      return () => socket.close()
   }, [enabled])

   return { operations, isLoading, error }
}
