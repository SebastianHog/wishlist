<script setup lang="ts">
const { profileSlug, isAdmin } = useAuth()
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 px-8 py-20 mb-6 text-center">
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-orange-300/20 blur-3xl"></div>
      <div class="relative">
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
      </div>
    </div>

    <!-- Feature cards -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <div class="text-3xl mb-2">🎯</div>
        <p class="font-semibold text-gray-800 text-sm">Prioritize</p>
        <p class="text-xs text-gray-400 mt-0.5">Rank what matters most</p>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <div class="text-3xl mb-2">🌟</div>
        <p class="font-semibold text-gray-800 text-sm">Plan ahead</p>
        <p class="text-xs text-gray-400 mt-0.5">Short &amp; long term</p>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <div class="text-3xl mb-2">✓</div>
        <p class="font-semibold text-gray-800 text-sm">Track gifts</p>
        <p class="text-xs text-gray-400 mt-0.5">Mark what's been gotten</p>
      </div>
    </div>
  </div>
</template>
