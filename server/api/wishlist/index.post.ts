export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{
    name: string
    description?: string
    link?: string
    price?: number
    image?: string
    priority: number
    list?: 'short' | 'long'
  }>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }

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
    createdAt: now,
    updatedAt: now,
  }

  items.push(newItem)
  await saveItems(items)

  return newItem
})
