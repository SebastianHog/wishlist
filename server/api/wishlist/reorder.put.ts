export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const updates = await readBody<{ id: string; priority: number }[]>(event)

  if (!Array.isArray(updates)) {
    throw createError({ statusCode: 400, message: 'Expected array of { id, priority }' })
  }

  const items = await getItems()
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
