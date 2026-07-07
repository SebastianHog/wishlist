<script setup lang="ts">
const { isAdmin, profileSlug, checkAuth, logout } = useAuth()
const { currency, fetchRate, CURRENCY_LIST } = useCurrency()
const route = useRoute()
const store = useWishlistStore()

onMounted(async () => {
  await Promise.all([checkAuth(), fetchRate()])
})

const routeProfile = computed(() => route.params.profile as string | undefined)
const isProfileAdmin = computed(() =>
  routeProfile.value && (profileSlug.value === routeProfile.value || isAdmin.value),
)
const profileName = computed(() =>
  store.profiles.find(p => p.slug === routeProfile.value)?.name ?? routeProfile.value,
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <span class="text-xl">🎁</span>
          <span class="text-base font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
            Wishlist
          </span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <select
            v-model="currency"
            class="text-xs font-semibold bg-white border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option v-for="c in CURRENCY_LIST" :key="c.code" :value="c.code">
              {{ c.label }}
            </option>
          </select>

          <template v-if="isAdmin">
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Super Admin
            </span>
            <NuxtLink to="/admin" class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Profiles</NuxtLink>
            <button class="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors" @click="logout">Sign out</button>
          </template>

          <template v-else-if="isProfileAdmin">
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              {{ profileName }}
            </span>
            <NuxtLink :to="`/${routeProfile}/admin`" class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Manage</NuxtLink>
            <button class="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors" @click="logout">Sign out</button>
          </template>

          <template v-else>
            <NuxtLink
              v-if="routeProfile"
              :to="`/${routeProfile}/login`"
              class="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >Manage</NuxtLink>
            <NuxtLink
              v-else
              to="/login"
              class="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >Admin</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>

    <footer class="text-center py-10 text-xs text-gray-300 tracking-wide">
      Made with ❤️
    </footer>
  </div>
</template>
