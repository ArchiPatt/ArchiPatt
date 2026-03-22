import type {SortType} from "./SortType.ts";

interface AccountTransactionRequest {
    id: string
    limit?: number
    offset?: number
    sort?: SortType
}

export type { AccountTransactionRequest }