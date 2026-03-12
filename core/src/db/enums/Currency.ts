export enum Currency {
  USD = "USD",
  EUR = "EUR",
  RUB = "RUB",
}

export const SUPPORTED_CURRENCIES: readonly Currency[] = [
  Currency.USD,
  Currency.EUR,
  Currency.RUB,
];

export function isSupportedCurrency(code: string): code is Currency {
  return SUPPORTED_CURRENCIES.includes(code as Currency);
}
