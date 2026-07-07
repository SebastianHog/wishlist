import type { H3Event } from 'h3'

export async function getAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  const secret = config.sessionSecret || 'wishlist-fallback-secret-key-32chars!!'
  return useSession(event, { password: secret, maxAge: 60 * 60 * 24 * 7 })
}

// Super admin (env-based password) — for profile management
export async function requireAdmin(event: H3Event) {
  const session = await getAdminSession(event)
  if (!session.data.isAdmin) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return session
}

// Wishlist item operations — allow super admin OR the profile's own session
export async function requireWishlistAuth(event: H3Event, profileSlug: string) {
  const session = await getAdminSession(event)
  if (session.data.isAdmin) return session
  if (session.data.profileSlug === profileSlug) return session
  throw createError({ statusCode: 401, message: 'Unauthorized' })
}
