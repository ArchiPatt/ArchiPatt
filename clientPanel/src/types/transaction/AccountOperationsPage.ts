import type {AccountOperation} from "./AccountOperation.ts";

interface AccountOperationsPage {
    items: AccountOperation[]
    total?: number
}

export type { AccountOperationsPage }