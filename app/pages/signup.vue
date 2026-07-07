<script setup lang="ts">
const { profileLogin } = useAuth()

const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!name.value.trim() || !password.value) return
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const profile = await $fetch<{ slug: string }>('/api/profiles', {
      method: 'POST',
      body: { name: name.value.trim(), password: password.value },
    })
    await profileLogin(profile.slug, password.value)
    await navigateTo(`/${profile.slug}/admin`)
  } catch (e: any) {
    error.value = e.data?.message ?? e.message ?? 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🎁</div>
        <h1 class="text-2xl font-bold text-gray-900">Create your wishlist</h1>
        <p class="text-gray-500 mt-1 text-sm">Pick a name and a password — that's it</p>
      </div>

      <form
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        @submit.prevent="submit"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Sebastian"
            autocomplete="name"
            autofocus
            class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="name.trim()" class="mt-1 text-xs text-gray-400">
            Your wishlist will be at <span class="font-mono">/{{ name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '…' }}</span>
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading || !name.trim() || !password || !confirmPassword"
          class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Creating…' : 'Create wishlist' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <NuxtLink to="/" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
