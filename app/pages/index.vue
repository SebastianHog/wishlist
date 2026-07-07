<script setup lang="ts">
import type { Profile } from '~/types/wishlist'

const { profileSlug, isAdmin } = useAuth()
const { data } = await useAsyncData('all-profiles', () => $fetch<Profile[]>('/api/profiles'))
const profiles = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 mb-6">
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-orange-300/20 blur-3xl"></div>

      <!-- Title section -->
      <div class="relative px-8 pt-16 pb-10 text-center">
        <div class="text-8xl mb-5 drop-shadow-lg">🎁</div>
        <h1 class="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none mb-2">Wishlist</h1>
        <p class="text-white/70 text-lg mt-3 font-light">Share what you want.</p>
        <div v-if="isAdmin" class="mt-8">
          <NuxtLink to="/admin" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors shadow-lg">
            Manage profiles →
          </NuxtLink>
        </div>
        <div v-else-if="profileSlug" class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink :to="`/${profileSlug}`" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors shadow-lg">
            My wishlist →
          </NuxtLink>
          <NuxtLink :to="`/${profileSlug}/admin`" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition-colors">
            Manage my list
          </NuxtLink>
        </div>
        <div v-else class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/signup" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors shadow-lg">
            Create your wishlist →
          </NuxtLink>
        </div>
      </div>

      <!-- Profiles list inside hero -->
      <div v-if="profiles.length > 0" class="relative px-6 pb-6">
        <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <p class="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Wishlists</p>
          <div class="space-y-2">
            <NuxtLink
              v-for="profile in profiles"
              :key="profile.slug"
              :to="`/${profile.slug}`"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
            >
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ profile.name[0].toUpperCase() }}
              </div>
              <span class="text-white font-semibold text-sm">{{ profile.name }}</span>
              <svg class="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
