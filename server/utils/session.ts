import type { H3Event } from 'h3'

export async function getAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  const secret = config.sessionSecret || 'wishlist-fallback-secret-key-32chars!!'
  return useSession(event, { password: secret, maxAge: 60 * 60 * 24 * 7 })
}

export async function requireAdmin(event: H3Event) {
  const session = await getAdminSession(event)
  if (!session.data.isAdmin) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return session
}
