const GATEWAY_WS =
    (import.meta.env.VITE_GATEWAY_WS_URL as string | undefined)?.replace(/\/$/, '') ||
    'ws://localhost:4004'

const serviceWorkerRegistartion = async () => {
    if (!('serviceWorker' in navigator)) return

    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
    }

    const reg = await navigator.serviceWorker.register('/serviceWorker.js')

    const send = () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'INIT',
                wsUrl: GATEWAY_WS
            })
        }
    }

    // 1. Сразу пробуем отправить
    send()

    // 2. Когда SW станет активным
    navigator.serviceWorker.ready.then(send)

    // 3. 🔥 КЛЮЧЕВОЕ: при смене SW
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[APP] controller changed')
        send()
    })
}

export { serviceWorkerRegistartion }
