import type {CreditStatus} from "./CreditStatus.ts";

interface RepayCreditResponse {
    id: string
    status: CreditStatus
    outstandingAmount: string
    closedAt: string
}

export type { RepayCreditResponse }