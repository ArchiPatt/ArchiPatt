import type {CreditResponse} from "../../../../types/credit/CreditResponse.ts";

type CreditCardInforamation = Omit<CreditResponse, 'clientId' | 'accountId' | 'closedAt' | 'tariffId'>

interface CreditCardProps {
    creditInformation: CreditCardInforamation
    percent: string
}

export type { CreditCardProps }