import type {CreditResponse} from "../../../types/CreditResponse.ts";

type CreditCardProps = Omit<CreditResponse, 'clientId' | 'accountId' | 'id' | 'closedAt'>

export type { CreditCardProps }