export default defineNuxtRouteMiddleware(async (to) => {
  const profileSlug = to.params.profile as string
  try {
    const fetchWithHeaders = useRequestFetch()
    const data = await fetchWithHeaders<{ isAdmin: boolean; profileSlug: string | null }>('/api/auth/me')
    if (data.isAdmin || data.profileSlug === profileSlug) {
      const { isAdmin, profileSlug: ps } = useAuth()
      isAdmin.value = data.isAdmin
      ps.value = data.profileSlug
      return
    }
  } catch {}
  return navigateTo(`/${profileSlug}/login`)
})
