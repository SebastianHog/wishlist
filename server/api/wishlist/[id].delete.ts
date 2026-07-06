export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const items = await getItems()
  const index = items.findIndex(i => i.id === id)

  if (index === -1) {
    throw createError({ statusCode: 404, message: 'Item not found' })
  }

  items.splice(index, 1)
  await saveItems(items)

  return { success: true }
})
