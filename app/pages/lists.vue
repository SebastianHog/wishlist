<script setup lang="ts">
import type { Profile } from '~/types/wishlist'

const { data } = await useAsyncData('all-profiles', () => $fetch<Profile[]>('/api/profiles'))
const profiles = computed(() => data.value ?? [])
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">All Wishlists</h1>
      <p class="text-gray-500 text-sm mt-1">Everyone's lists in one place</p>
    </div>

    <div v-if="profiles.length === 0" class="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
      <div class="text-5xl mb-3">🎁</div>
      <p class="text-gray-500">No wishlists yet</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="profile in profiles"
        :key="profile.slug"
        :to="`/${profile.slug}`"
        class="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {{ profile.name[0].toUpperCase() }}
          </div>
          <div>
            <p class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ profile.name }}</p>
            <p class="text-xs text-gray-400 font-mono">/{{ profile.slug }}</p>
          </div>
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
