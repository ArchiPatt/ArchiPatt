import type {accountOperations} from "./accountOperations.ts";

interface accountTransaction {
    items: accountOperations[]
    total: number
}

export { accountTransaction }