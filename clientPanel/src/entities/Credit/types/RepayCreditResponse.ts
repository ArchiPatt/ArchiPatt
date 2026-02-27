import type {creditStatus} from "../../../types/creditStatus.ts";

interface RepayCreditResponse {
    id: string
    status: creditStatus
    outstandingAmount: string
    closedAt: string
}

export type { RepayCreditResponse }