export default defineNuxtRouteMiddleware(async () => {
  try {
    const fetchWithHeaders = useRequestFetch()
    const data = await fetchWithHeaders<{ isAdmin: boolean }>('/api/auth/me')
    if (!data.isAdmin) return navigateTo('/login')
    const { isAdmin } = useAuth()
    isAdmin.value = true
  } catch {
    return navigateTo('/login')
  }
})
