<script setup lang="ts">
const { isAdmin, checkAuth, logout } = useAuth()
const { currency, toggle: toggleCurrency, fetchRate } = useCurrency()

onMounted(async () => {
  await Promise.all([checkAuth(), fetchRate()])
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <span class="text-2xl">🎁</span>
          <span class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            Wishlist
          </span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <!-- Currency toggle -->
          <button
            class="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all"
            :class="currency === 'EUR'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'"
            :title="currency === 'SEK' ? 'Switch to EUR' : 'Switch to SEK'"
            @click="toggleCurrency"
          >
            {{ currency === 'SEK' ? 'kr SEK' : '€ EUR' }}
          </button>

          <span
            v-if="isAdmin"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Admin Mode
          </span>

          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
          >
            Dashboard
          </NuxtLink>

          <button
            v-if="isAdmin"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            @click="logout"
          >
            Sign out
          </button>

          <NuxtLink
            v-else
            to="/login"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Admin
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <footer class="text-center py-8 text-sm text-gray-400">
      Made with ❤️
    </footer>
  </div>
</template>
