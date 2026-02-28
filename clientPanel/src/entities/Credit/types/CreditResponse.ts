import type {CreditStatus} from "./CreditStatus.ts";

interface CreditResponse {
    id: string
    clientId: string
    accountId: string
    tariffId: string
    principalAmount: string
    outstandingAmount: string
    status: CreditStatus
    issuedAt: string
    nextPaymentDueAt: string
    closedAt?: string
    createdAt: string
}

export type { CreditResponse }