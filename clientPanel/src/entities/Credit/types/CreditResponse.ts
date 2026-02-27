import type {creditStatus} from "../../../types/creditStatus.ts";

interface CreditResponse {
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

export type { CreditResponse }