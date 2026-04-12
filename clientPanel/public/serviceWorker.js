const RECONNECT_DELAY = 3000
let wsUrl = null
let ws = null

self.addEventListener('install', () => {
    console.log('[SW] installed')
    self.skipWaiting()
})

self.addEventListener('activate', (e) => {
    console.log('[SW] activated')
    e.waitUntil(self.clients.claim())
    self.registration.cookies?.subscribe([{ name: 'token' }]).catch(() => {})
})

// Main thread передаёт только WS URL один раз
self.addEventListener('message', (e) => {
    if (e.data?.type === 'INIT') {
        wsUrl = e.data.wsUrl
        console.log('[SW] INIT, wsUrl:', wsUrl)
        connect()
    }
})

// Токен обновился в куках — переподключаемся
self.addEventListener('cookiechange', () => {
    console.log('[SW] cookie changed, reconnecting')
    connect()
})

const getToken = async () => {
    return (await cookieStore.get('token'))?.value ?? null
}

const connect = async () => {
    if (ws) {
        ws.onclose = null
        ws.close()
        ws = null
    }

    const token = await getToken()
    if (!wsUrl || !token) {
        console.log('[SW] no wsUrl or token, skipping connect')
        return
    }

    console.log('[SW] connecting to WS', token)
    ws = new WebSocket(
        `${wsUrl}/ws/staff/operations?authorization=${encodeURIComponent(`Bearer ${token}`)}`
    )

    ws.onopen = () => console.log('[SW] WS connected')

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.type === 'operation_added' && data.operation) {
            console.log('[SW] operation_added:', data.operation.id)
            notify(data.operation)
        }
    }

    ws.onerror = (err) => console.log('[SW] WS error', err)

    ws.onclose = () => {
        console.log('[SW] WS closed, reconnecting in', RECONNECT_DELAY, 'ms')
        setTimeout(connect, RECONNECT_DELAY)
    }
}

const notify = (op) => {
    const amount = parseFloat(op.amount || '0')
    const abs = Math.abs(amount).toFixed(2)
    const isDeposit = op.type === 'deposit' || op.type === 'seed_deposit' || (!op.type && amount > 0)

    self.registration.showNotification(`Счёт: ${op.accountId}`, {
        body: `${isDeposit ? 'Пополнение' : 'Снятие'} ${abs}`,
        tag: op.id
    })
}

self.addEventListener('notificationclick', (e) => {
    e.notification.close()
    e.waitUntil(
        self.clients
            .matchAll({ type: 'window' })
            .then((c) => c[0]?.focus() ?? self.clients.openWindow('/'))
    )
})
