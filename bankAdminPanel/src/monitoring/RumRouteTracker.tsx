import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sendRumNavigation } from './rum'

/** Отправляет RUM при смене маршрута (SPA). */
export function RumRouteTracker() {
   const loc = useLocation()
   useEffect(() => {
      sendRumNavigation(loc.pathname + loc.search)
   }, [loc.pathname, loc.search])
   return null
}
