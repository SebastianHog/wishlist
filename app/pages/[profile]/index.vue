<script setup lang="ts">
import type { WishlistList, WishlistItem, Profile } from '~/types/wishlist'

const route = useRoute()
const store = useWishlistStore()

const [{ data: profilesData }, { data: itemsData }] = await Promise.all([
  useAsyncData('profiles', () => $fetch<Profile[]>('/api/profiles')),
  useAsyncData('wishlist-items', () => $fetch<WishlistItem[]>('/api/wishlist')),
])
if (profilesData.value) store.profiles = profilesData.value
if (itemsData.value) store.items = itemsData.value

const profileSlug = computed(() => route.params.profile as string)
watchEffect(() => { store.activeProfile = profileSlug.value })

const profile = computed(() => store.profiles.find(p => p.slug === profileSlug.value))

const compact = ref(true)
onMounted(() => {
  const stored = localStorage.getItem('wishlist-compact')
  if (stored !== null) compact.value = stored === 'true'
})
watch(compact, val => localStorage.setItem('wishlist-compact', String(val)))

const activeList = ref<WishlistList>('short')

const currentGroups = computed(() =>
  activeList.value === 'short' ? store.shortTermGroups : store.longTermGroups,
)
const currentGotten = computed(() => store.gottenFor(activeList.value))
const hasAnyItems = computed(() => store.shortTermGroups.length > 0 || store.longTermGroups.length > 0)

const gridClass = (priority: number) => {
  if (compact.value) return 'flex flex-col gap-1.5'
  if (priority === 1) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
  if (priority === 2) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
  if (priority === 3) return 'grid grid-cols-2 sm:grid-cols-3 gap-3'
  return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
}
</script>

<template>
  <div>
    <div v-if="!profile" class="text-center py-24">
      <div class="text-6xl mb-4">🔍</div>
      <p class="text-xl font-semibold text-gray-700">Profile not found</p>
      <NuxtLink to="/" class="mt-4 inline-block text-indigo-600 hover:underline text-sm">← Back</NuxtLink>
    </div>

    <template v-else>
      <div class="mb-8 flex items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-4xl font-extrabold text-gray-900">{{ profile.name }}'s Wishlist 🎁</h1>
          <p class="mt-1 text-gray-500 text-sm">Things are ordered by priority — #1 is the most wanted.</p>
        </div>

        <button
          v-if="hasAnyItems"
          class="flex-shrink-0 mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all"
          :class="compact
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'"
          @click="compact = !compact"
        >
          <svg v-if="!compact" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          {{ compact ? 'Cards' : 'Compact' }}
        </button>
      </div>

      <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        <button
          class="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
          :class="activeList === 'short' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="activeList = 'short'"
        >
          🎯 Short Term
          <span v-if="store.shortTermGroups.length > 0" class="ml-1.5 text-xs font-medium text-gray-400">
            {{ store.shortTermGroups.reduce((n, g) => n + g.items.length, 0) }}
          </span>
        </button>
        <button
          class="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
          :class="activeList === 'long' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="activeList = 'long'"
        >
          🌟 Long Term
          <span v-if="store.longTermGroups.length > 0" class="ml-1.5 text-xs font-medium text-gray-400">
            {{ store.longTermGroups.reduce((n, g) => n + g.items.length, 0) }}
          </span>
        </button>
      </div>

      <div v-if="store.loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>

      <template v-else-if="currentGroups.length > 0">
        <div :class="compact ? 'space-y-4' : 'space-y-8'">
          <section v-for="group in currentGroups" :key="group.priority">
            <div class="flex items-center gap-3 mb-3">
              <span
                class="inline-flex items-center justify-center rounded-full font-bold flex-shrink-0"
                :class="{
                  'bg-yellow-400 text-yellow-900 w-10 h-10 text-base': group.priority === 1 && !compact,
                  'bg-yellow-400 text-yellow-900 w-8 h-8 text-sm': group.priority === 1 && compact,
                  'bg-gray-300 text-gray-700 w-9 h-9 text-sm': group.priority === 2 && !compact,
                  'bg-gray-300 text-gray-700 w-8 h-8 text-sm': group.priority === 2 && compact,
                  'bg-amber-600 text-amber-100 w-8 h-8 text-sm': group.priority === 3,
                  'bg-indigo-100 text-indigo-600 w-8 h-8 text-sm': group.priority > 3,
                }"
              >
                #{{ group.priority }}
              </span>
              <div class="h-px flex-1 bg-gray-100"></div>
            </div>

            <div :class="gridClass(group.priority)">
              <WishlistItem
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                :priority="group.priority"
                :compact="compact"
              />
            </div>
          </section>
        </div>
      </template>

      <div v-else class="text-center py-24">
        <div class="text-6xl mb-4">{{ activeList === 'short' ? '🎯' : '🌟' }}</div>
        <p class="text-xl font-semibold text-gray-700">No {{ activeList === 'short' ? 'short term' : 'long term' }} wishes yet!</p>
        <p class="text-gray-400 mt-1">Check back soon.</p>
      </div>

      <template v-if="currentGotten.length > 0">
        <div class="mt-16 pt-10 border-t border-gray-100">
          <h2 class="text-lg font-semibold text-gray-400 mb-5 flex items-center gap-2">
            <span>✓</span> Already on the way
          </h2>
          <div :class="compact ? 'flex flex-col gap-1.5' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'">
            <WishlistItem
              v-for="item in currentGotten"
              :key="item.id"
              :item="item"
              :priority="99"
              :compact="compact"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
