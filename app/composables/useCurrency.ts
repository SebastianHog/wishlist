export type Currency = 'SEK' | 'USD' | 'EUR' | 'TRY'

export const CURRENCY_LIST: { code: Currency; label: string }[] = [
  { code: 'SEK', label: 'kr SEK' },
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'TRY', label: '₺ TRY' },
]

const FALLBACK_RATES: Record<string, number> = {
  EUR: 1, SEK: 11.0, USD: 1.08, TRY: 38.5,
}

const LOCALE_MAP: Record<Currency, string> = {
  SEK: 'sv-SE', USD: 'en-US', EUR: 'de-DE', TRY: 'tr-TR',
}

export const useCurrency = () => {
  const currency = useState<Currency>('currency', () => 'SEK')
  const rates = useState<Record<string, number>>('currencyRates', () => ({ ...FALLBACK_RATES }))
  const rateLoaded = useState<boolean>('rateLoaded', () => false)

  const fetchRate = async () => {
    if (rateLoaded.value) return
    try {
      const data = await $fetch<{ rates: Record<string, number> }>('/api/currency/rates')
      rates.value = { EUR: 1, ...data.rates }
    } catch {
      // keep fallback rates
    } finally {
      rateLoaded.value = true
    }
  }

  // Prices stored in SEK → convert to any currency via EUR as pivot
  const format = (priceSek: number | undefined | null): string | null => {
    if (priceSek === undefined || priceSek === null) return null
    const cur = currency.value
    const sekPerEur = rates.value['SEK'] ?? FALLBACK_RATES['SEK']
    const targetPerEur = rates.value[cur] ?? FALLBACK_RATES[cur] ?? 1
    const converted = (priceSek / sekPerEur) * targetPerEur
    return new Intl.NumberFormat(LOCALE_MAP[cur], {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: cur === 'SEK' ? 0 : 2,
    }).format(converted)
  }

  return { currency, rates, rateLoaded, fetchRate, format, CURRENCY_LIST }
}
