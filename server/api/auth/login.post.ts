export default defineEventHandler(async (event) => {
  const body = await readBody<{ password: string }>(event)
  const config = useRuntimeConfig(event)
  const adminPassword = config.adminPassword || 'admin123'

  if (!body?.password || body.password !== adminPassword) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  const session = await getAdminSession(event)
  await session.update({ isAdmin: true })

  return { success: true }
})
