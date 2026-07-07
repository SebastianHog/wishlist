export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const items = await getItems()
  const index = items.findIndex(i => i.id === id)

  if (index === -1) throw createError({ statusCode: 404, message: 'Item not found' })

  await requireWishlistAuth(event, items[index].profile)

  const body = await readBody<Partial<import('~/server/utils/db').WishlistItem>>(event)

  items[index] = {
    ...items[index],
    ...body,
    id: items[index].id,
    profile: items[index].profile, // profile is immutable via this endpoint
    createdAt: items[index].createdAt,
    updatedAt: new Date().toISOString(),
  }

  await saveItems(items)
  return items[index]
})
