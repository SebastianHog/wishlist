export const useAuth = () => {
  const isAdmin = useState<boolean>('isAdmin', () => false)
  const profileSlug = useState<string | null>('profileSlug', () => null)

  const checkAuth = async () => {
    try {
      const data = await $fetch<{ isAdmin: boolean; profileSlug: string | null }>('/api/auth/me')
      isAdmin.value = data.isAdmin
      profileSlug.value = data.profileSlug
    } catch {
      isAdmin.value = false
      profileSlug.value = null
    }
  }

  const login = async (password: string) => {
    await $fetch('/api/auth/login', { method: 'POST', body: { password } })
    isAdmin.value = true
  }

  const profileLogin = async (slug: string, password: string) => {
    await $fetch('/api/auth/profile-login', { method: 'POST', body: { slug, password } })
    profileSlug.value = slug
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    isAdmin.value = false
    profileSlug.value = null
    await navigateTo('/')
  }

  return { isAdmin, profileSlug, checkAuth, login, profileLogin, logout }
}
