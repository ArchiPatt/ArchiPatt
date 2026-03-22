import type {CreditResponse} from "../../../../../generated/api/credits";

type CreditCardInforamation = Omit<CreditResponse, 'clientId' | 'accountId' | 'closedAt' | 'tariffId'>

interface CreditCardProps {
    creditInformation: CreditCardInforamation
    percent: string
}

export type { CreditCardProps }