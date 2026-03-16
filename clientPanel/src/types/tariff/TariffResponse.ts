interface TariffResponse {
    id: string
    name: string
    interestRate: string
    billingPeriodDays: number
    isActive: boolean
    createdAt: string
}

export type { TariffResponse }