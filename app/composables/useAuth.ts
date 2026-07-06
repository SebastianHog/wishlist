export const useAuth = () => {
  const isAdmin = useState<boolean>('isAdmin', () => false)
  const loading = useState<boolean>('authLoading', () => false)

  const checkAuth = async () => {
    try {
      const data = await $fetch<{ isAdmin: boolean }>('/api/auth/me')
      isAdmin.value = data.isAdmin
    } catch {
      isAdmin.value = false
    }
  }

  const login = async (password: string) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password },
    })
    isAdmin.value = true
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    isAdmin.value = false
    await navigateTo('/')
  }

  return { isAdmin, loading, checkAuth, login, logout }
}
