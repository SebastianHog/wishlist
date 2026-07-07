<script setup lang="ts">
import type { Profile } from '~/types/wishlist'

const route = useRoute()
const profileSlug = route.params.profile as string
const { profileSlug: sessionProfile, profileLogin } = useAuth()
const store = useWishlistStore()

const { data } = await useAsyncData('profiles', () => $fetch<Profile[]>('/api/profiles'))
if (data.value) store.profiles = data.value

const profile = computed(() => store.profiles.find(p => p.slug === profileSlug))

if (sessionProfile.value === profileSlug) {
  await navigateTo(`/${profileSlug}/admin`)
}

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    await profileLogin(profileSlug, password.value)
    await navigateTo(`/${profileSlug}/admin`)
  } catch (e: any) {
    error.value = e.data?.message ?? 'Invalid password'
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🔐</div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ profile ? `${profile.name}'s Wishlist` : 'Sign in' }}
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Enter your password to manage your wishlist</p>
      </div>

      <form
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        @submit.prevent="submit"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            autofocus
            class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading || !password"
          class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <NuxtLink :to="`/${profileSlug}`" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← View wishlist
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
