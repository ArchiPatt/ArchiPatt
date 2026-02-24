type accountStatus = 'open' | 'closed'

interface account {
    id: string
    clientId: string
    balance: string
    status: accountStatus
    createdAt: string
}

export type { account }