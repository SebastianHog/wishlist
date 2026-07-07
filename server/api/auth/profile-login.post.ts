export default defineEventHandler(async (event) => {
  const body = await readBody<{ slug: string; password: string }>(event)
  if (!body?.slug || !body?.password) {
    throw createError({ statusCode: 400, message: 'slug and password required' })
  }

  const profiles = await getProfiles()
  const profile = profiles.find(p => p.slug === body.slug)
  if (!profile || profile.password !== body.password) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  const session = await getAdminSession(event)
  await session.update({ profileSlug: profile.slug })

  return { success: true }
})
