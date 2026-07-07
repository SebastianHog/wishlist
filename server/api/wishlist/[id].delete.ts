export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const items = await getItems()
  const index = items.findIndex(i => i.id === id)

  if (index === -1) throw createError({ statusCode: 404, message: 'Item not found' })

  await requireWishlistAuth(event, items[index].profile)

  items.splice(index, 1)
  await saveItems(items)
  return { success: true }
})
