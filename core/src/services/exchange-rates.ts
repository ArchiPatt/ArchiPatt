import { Currency, isSupportedCurrency } from "../db/enums/Currency";

const API_BASE = "https://open.er-api.com/v6/latest";
const CACHE_TTL_MS = 60_000;

type RatesCache = {
  base: Currency;
  rates: Record<string, number>;
  fetchedAt: number;
};

const cache = new Map<Currency, RatesCache>();

async function fetchRates(base: Currency): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/${base}`);
  if (!res.ok) {
    throw new Error(`Exchange rate API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as {
    result?: string;
    base_code?: string;
    rates?: Record<string, number>;
  };
  if (data.result !== "success" || !data.rates) {
    throw new Error("Invalid exchange rate API response");
  }
  return data.rates;
}

function getCachedRates(base: Currency): Record<string, number> | null {
  const entry = cache.get(base);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
  return entry.rates;
}

async function getRatesForBase(
  base: Currency,
): Promise<Record<string, number>> {
  const cached = getCachedRates(base);
  if (cached) return cached;
  const rates = await fetchRates(base);
  cache.set(base, { base, rates, fetchedAt: Date.now() });
  return rates;
}

export async function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;
  if (!isSupportedCurrency(fromCurrency) || !isSupportedCurrency(toCurrency)) {
    throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
  }
  const rates = await getRatesForBase(fromCurrency);
  const toRate = rates[toCurrency];
  if (
    toRate == null ||
    typeof toRate !== "number" ||
    !Number.isFinite(toRate)
  ) {
    throw new Error(`Rate not found for ${fromCurrency} -> ${toCurrency}`);
  }
  return toRate;
}

export async function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const converted = amount * rate;
  return Math.round(converted * 100) / 100;
}
