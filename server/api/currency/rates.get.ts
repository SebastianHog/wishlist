const CURRENCIES = ['SEK', 'USD', 'TRY']

const FALLBACK: Record<string, number> = {
  SEK: 11.0, USD: 1.08, TRY: 38.5,
}

let cache: { rates: Record<string, number>; fetchedAt: number } | null = null
const CACHE_TTL = 60 * 60 * 1000

export default defineEventHandler(async () => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return { rates: cache.rates }
  }

  try {
    const xml = await $fetch<string>(
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
      { responseType: 'text' },
    )

    const rates: Record<string, number> = { EUR: 1 }
    for (const code of CURRENCIES) {
      const match = xml.match(new RegExp(`currency='${code}'\\s+rate='([\\d.]+)'`))
      rates[code] = match ? parseFloat(match[1]) : FALLBACK[code]
    }

    cache = { rates, fetchedAt: Date.now() }
    return { rates }
  } catch {
    return { rates: { EUR: 1, ...FALLBACK }, fallback: true }
  }
})
