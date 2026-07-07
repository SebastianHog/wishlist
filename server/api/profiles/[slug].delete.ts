export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const slug = getRouterParam(event, 'slug')
  const profiles = await getProfiles()
  const idx = profiles.findIndex(p => p.slug === slug)
  if (idx === -1) throw createError({ statusCode: 404, message: 'Profile not found' })

  profiles.splice(idx, 1)
  await saveProfiles(profiles)

  // Cascade-delete all items belonging to this profile
  const items = await getItems()
  await saveItems(items.filter(i => i.profile !== slug))

  return { ok: true }
})
