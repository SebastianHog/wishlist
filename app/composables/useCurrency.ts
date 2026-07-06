type Currency = 'SEK' | 'EUR'

export const useCurrency = () => {
  const currency = useState<Currency>('currency', () => 'SEK')
  const eurToSek = useState<number>('eurToSek', () => 11.5)
  const rateLoaded = useState<boolean>('rateLoaded', () => false)

  const fetchRate = async () => {
    if (rateLoaded.value) return
    try {
      const data = await $fetch<{ rate: number }>('/api/currency/eur-sek')
      eurToSek.value = data.rate
    } catch {
      // keep default 11.5 fallback
    } finally {
      rateLoaded.value = true
    }
  }

  const toggle = async () => {
    currency.value = currency.value === 'SEK' ? 'EUR' : 'SEK'
    await fetchRate()
  }

  // Prices are stored in SEK; convert to EUR on demand.
  const format = (priceSek: number | undefined | null): string | null => {
    if (priceSek === undefined || priceSek === null) return null

    if (currency.value === 'SEK') {
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
        maximumFractionDigits: 0,
      }).format(priceSek)
    }

    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceSek / eurToSek.value)
  }

  return { currency, eurToSek, rateLoaded, fetchRate, toggle, format }
}
