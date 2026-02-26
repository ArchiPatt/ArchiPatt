import type {creditStatus} from "./creditStatus.ts";

interface creditResponse {
    id: string
    clientId: string
    accountId: string
    tariffId: string
    principalAmount: string
    outstandingAmount: string
    status: creditStatus
    issuedAt: string
    nextPaymentDueAt: string
    closedAt?: string
    createdAt: string
}

export type { creditResponse }