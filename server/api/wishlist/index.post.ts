export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  if (!session.data.isAdmin && !session.data.profileSlug) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<{
    name: string
    description?: string
    link?: string
    price?: number
    image?: string
    priority: number
    list?: 'short' | 'long'
    profile?: string
  }>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }

  // Profile admins can only add items to their own profile
  const profileSlug = session.data.isAdmin
    ? (body.profile ?? '')
    : (session.data.profileSlug as string)

  const items = await getItems()
  const now = new Date().toISOString()

  const newItem: import('~/server/utils/db').WishlistItem = {
    id: generateId(),
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    link: body.link?.trim() || undefined,
    price: body.price !== undefined ? Number(body.price) : undefined,
    image: body.image?.trim() || undefined,
    priority: body.priority ?? 1,
    gotten: false,
    list: body.list ?? 'short',
    profile: profileSlug,
    createdAt: now,
    updatedAt: now,
  }

  items.push(newItem)
  await saveItems(items)
  return newItem
})
