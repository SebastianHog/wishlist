// Fetches EUR→SEK from the European Central Bank's free XML feed.
// Rate is cached for 1 hour per process.
let cache: { rate: number; fetchedAt: number } | null = null
const CACHE_TTL = 60 * 60 * 1000

export default defineEventHandler(async () => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return { rate: cache.rate, fetchedAt: cache.fetchedAt }
  }

  try {
    const xml = await $fetch<string>(
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
      { responseType: 'text' },
    )
    const match = xml.match(/currency='SEK'\s+rate='([\d.]+)'/)
    if (!match) throw new Error('SEK rate not found in ECB feed')

    const rate = parseFloat(match[1])
    cache = { rate, fetchedAt: Date.now() }
    return { rate, fetchedAt: cache.fetchedAt }
  } catch (e: any) {
    // Fall back to a hardcoded approximate if fetch fails
    const fallbackRate = 11.5
    return { rate: fallbackRate, fetchedAt: 0, fallback: true }
  }
})
