import { useEffect } from 'react'
import Cookies from 'js-cookie'
export const useAccountOperationsWS = (id: string) => {
   useEffect(() => {
      const socket = new WebSocket(
         `ws://localhost:4003/ws/accounts/${id}/operations?authorization=Bearer ${Cookies.get('accessToken')}`
      )
      socket.onopen = () => {
         console.log('WebSocket connection opened')
      }
      socket.onmessage = (event) => {
         console.log('Received message:', event.data)
      }
      return () => {
         socket.close()
      }
   }, [])
}
