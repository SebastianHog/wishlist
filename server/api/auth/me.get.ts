export default defineEventHandler(async (event) => {
  const session = await getAdminSession(event)
  return {
    isAdmin: session.data.isAdmin === true,
    profileSlug: session.data.profileSlug ?? null,
  }
})
