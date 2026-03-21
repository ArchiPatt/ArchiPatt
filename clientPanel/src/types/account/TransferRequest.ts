interface TransferRequest {
    fromAccountId: string
    toAccountId: string
    amount: number
    idempotencyKey?: string
}

export type { TransferRequest }