const GATEWAY_WS =
   (import.meta.env.VITE_GATEWAY_WS_URL as string | undefined)?.replace(/\/$/, '') ||
   'ws://localhost:4004'

export const registerServiceWorker = async () => {
   if (!('serviceWorker' in navigator)) return

   if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
   }

   const reg = await navigator.serviceWorker.register('/sw.js')

   const send = () => reg.active?.postMessage({ type: 'INIT', wsUrl: GATEWAY_WS })

   if (reg.active) {
      send()
   } else {
      navigator.serviceWorker.ready.then(send)
   }
}
