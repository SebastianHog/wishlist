export default defineEventHandler(async (event) => {
  const updates = await readBody<{ id: string; priority: number }[]>(event)

  if (!Array.isArray(updates) || updates.length === 0) {
    throw createError({ statusCode: 400, message: 'Expected array of { id, priority }' })
  }

  const items = await getItems()

  // Auth: check against the profile of the first item being reordered
  const firstItem = items.find(i => i.id === updates[0].id)
  if (firstItem) await requireWishlistAuth(event, firstItem.profile)

  const now = new Date().toISOString()
  for (const { id, priority } of updates) {
    const item = items.find(i => i.id === id)
    if (item) {
      item.priority = priority
      item.updatedAt = now
    }
  }

  await saveItems(items)
  return { success: true }
})
