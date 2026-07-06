export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody<Partial<import('~/server/utils/db').WishlistItem>>(event)
  const items = await getItems()
  const index = items.findIndex(i => i.id === id)

  if (index === -1) {
    throw createError({ statusCode: 404, message: 'Item not found' })
  }

  items[index] = {
    ...items[index],
    ...body,
    id: items[index].id,
    createdAt: items[index].createdAt,
    updatedAt: new Date().toISOString(),
  }

  await saveItems(items)
  return items[index]
})
