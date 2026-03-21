import type {Currency} from "./Currency.ts";

interface CreateAccountRequest {
    clientId: string
    currency: Currency
}

export type { CreateAccountRequest };