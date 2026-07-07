const RESERVED = ['login', 'admin']

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; password: string; slug?: string }>(event)
  if (!body?.name?.trim()) throw createError({ statusCode: 400, message: 'Name is required' })
  if (!body?.password) throw createError({ statusCode: 400, message: 'Password is required' })

  const slug = body.slug?.trim() || slugify(body.name.trim())
  if (!slug) throw createError({ statusCode: 400, message: 'Could not generate a URL from that name' })
  if (RESERVED.includes(slug)) throw createError({ statusCode: 400, message: `"${slug}" is a reserved URL` })

  const profiles = await getProfiles()
  if (profiles.find(p => p.slug === slug)) {
    throw createError({ statusCode: 409, message: 'A profile with this URL already exists' })
  }

  const profile: import('~/server/utils/db').Profile = {
    id: generateId(),
    name: body.name.trim(),
    slug,
    password: hashPassword(body.password),
    createdAt: new Date().toISOString(),
  }

  profiles.push(profile)
  await saveProfiles(profiles)

  const { password: _, ...safe } = profile
  return safe
})
