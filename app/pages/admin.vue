<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const store = useWishlistStore()

await useAsyncData('admin-profiles', () => $fetch('/api/profiles').then(d => {
  store.profiles = d as any
  return d
}))

const newName = ref('')
const newPassword = ref('')
const saving = ref(false)
const formError = ref('')

async function createProfile() {
  if (!newName.value.trim() || !newPassword.value) return
  saving.value = true
  formError.value = ''
  try {
    await $fetch('/api/profiles', {
      method: 'POST',
      body: { name: newName.value.trim(), password: newPassword.value },
    })
    const fresh = await $fetch<any[]>('/api/profiles')
    store.profiles = fresh
    newName.value = ''
    newPassword.value = ''
  } catch (e: any) {
    formError.value = e.data?.message ?? e.message ?? 'Error'
  } finally {
    saving.value = false
  }
}

const confirmDeleteSlug = ref<string | null>(null)
const deleting = ref(false)

async function doDelete() {
  if (!confirmDeleteSlug.value) return
  deleting.value = true
  try {
    await store.deleteProfile(confirmDeleteSlug.value)
  } finally {
    deleting.value = false
    confirmDeleteSlug.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Profile Management</h1>
      <p class="text-gray-500 text-sm mt-0.5">Create and manage wishlist profiles</p>
    </div>

    <div class="space-y-3 mb-8">
      <div
        v-for="profile in store.profiles"
        :key="profile.slug"
        class="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        <div>
          <p class="font-semibold text-gray-900">{{ profile.name }}</p>
          <p class="text-xs text-gray-400 mt-0.5">
            <span class="font-mono">/ {{ profile.slug }}</span>
            · password: ••••••
          </p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/${profile.slug}`"
            class="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            View
          </NuxtLink>
          <button
            class="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            @click="confirmDeleteSlug = profile.slug"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-if="store.profiles.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
        No profiles yet — create one below
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 class="text-base font-bold text-gray-900 mb-4">New Profile</h2>
      <form class="space-y-3" @submit.prevent="createProfile">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="newName"
              type="text"
              placeholder="e.g. Sebastian"
              class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Their login password"
              class="w-full rounded-xl border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <p v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</p>

        <button
          type="submit"
          :disabled="saving || !newName.trim() || !newPassword"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {{ saving ? 'Creating…' : 'Create profile' }}
        </button>
      </form>
    </div>

    <Teleport to="body">
      <div
        v-if="confirmDeleteSlug"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="confirmDeleteSlug = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">Delete profile?</h3>
          <p class="text-sm text-gray-500 mb-6">
            This will permanently delete
            <strong>{{ store.profiles.find(p => p.slug === confirmDeleteSlug)?.name }}</strong>
            and all their wishlist items.
          </p>
          <div class="flex gap-3">
            <button class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" @click="confirmDeleteSlug = null">Cancel</button>
            <button class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors" :disabled="deleting" @click="doDelete">
              {{ deleting ? 'Deleting…' : 'Delete everything' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
