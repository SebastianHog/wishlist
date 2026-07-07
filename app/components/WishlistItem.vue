<script setup lang="ts">
import type { WishlistItem } from '~/types/wishlist'

const props = defineProps<{
  item: WishlistItem
  priority: number
  isAdmin?: boolean
  isDragging?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  edit: [item: WishlistItem]
  delete: [id: string]
  toggleGotten: [id: string]
}>()

const sizeConfig = computed(() => {
  if (props.priority === 1) return { imgAspect: 'aspect-[4/3]', imgPad: 'p-4', title: 'text-2xl', card: 'p-6', badge: 'text-base px-3 py-1' }
  if (props.priority === 2) return { imgAspect: 'aspect-[4/3]', imgPad: 'p-3', title: 'text-xl',  card: 'p-5', badge: 'text-sm px-2.5 py-0.5' }
  if (props.priority === 3) return { imgAspect: 'aspect-square',  imgPad: 'p-3', title: 'text-lg',  card: 'p-4', badge: 'text-sm px-2.5 py-0.5' }
  return                           { imgAspect: 'aspect-square',  imgPad: 'p-2', title: 'text-base', card: 'p-4', badge: 'text-xs px-2 py-0.5' }
})

const { format: formatPrice } = useCurrency()
const formattedPrice = computed(() => formatPrice(props.item.price))

const cardTag = computed(() => props.item.link && !props.isAdmin ? 'a' : 'div')
const cardLinkProps = computed(() =>
  props.item.link && !props.isAdmin
    ? { href: props.item.link, target: '_blank', rel: 'noopener noreferrer' }
    : {}
)
</script>

<template>
  <!-- Compact horizontal card -->
  <component
    :is="cardTag"
    v-bind="cardLinkProps"
    v-if="compact"
    class="group bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 overflow-hidden flex items-center gap-3 px-3 py-2.5"
    :class="[
      item.gotten ? 'opacity-50 grayscale' : 'hover:border-gray-200 hover:shadow',
      isDragging ? 'shadow-xl scale-105' : '',
      item.link && !isAdmin ? 'cursor-pointer' : '',
    ]"
  >
    <div
      v-if="item.image"
      class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1"
    >
      <img
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-contain"
        @error="($event.target as HTMLImageElement).closest('div')!.style.display = 'none'"
      />
    </div>
    <div v-else class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 text-xl">
      🎁
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-900 truncate leading-tight" :class="item.gotten ? 'line-through text-gray-400' : ''">
        {{ item.name }}
      </p>
      <p v-if="item.description" class="text-xs text-gray-400 truncate leading-tight mt-0.5">{{ item.description }}</p>
    </div>

    <div class="flex-shrink-0 flex items-center gap-2">
      <span v-if="item.gotten" class="text-xs font-semibold text-green-600">✓</span>
      <span v-if="formattedPrice" class="text-xs font-semibold text-indigo-600 whitespace-nowrap">{{ formattedPrice }}</span>
      <a
        v-if="item.link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-300 hover:text-indigo-500 transition-colors"
        @click.stop
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      <div v-if="isAdmin" class="flex items-center gap-0.5 ml-1" style="touch-action: manipulation">
        <button
          class="p-2 rounded-lg text-gray-300 hover:text-green-500 transition-colors"
          :class="item.gotten ? 'text-green-500' : ''"
          :title="item.gotten ? 'Mark as not received' : 'Mark as received'"
          style="touch-action: manipulation"
          @click.stop="emit('toggleGotten', item.id)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button class="p-2 rounded-lg text-gray-300 hover:text-blue-500 transition-colors" style="touch-action: manipulation" @click.stop="emit('edit', item)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="p-2 rounded-lg text-gray-300 hover:text-red-500 transition-colors" style="touch-action: manipulation" @click.stop="emit('delete', item.id)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </component>

  <!-- Normal card -->
  <component
    :is="cardTag"
    v-bind="cardLinkProps"
    v-else
    class="group bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 overflow-hidden"
    :class="[
      item.gotten ? 'opacity-50 grayscale' : 'hover:border-gray-200 hover:-translate-y-0.5 hover:shadow-md',
      isDragging ? 'shadow-xl rotate-1 scale-105' : '',
      item.link && !isAdmin ? 'cursor-pointer' : '',
    ]"
  >
    <div
      v-if="item.image"
      class="overflow-hidden bg-gray-50 border-b border-gray-100"
      :class="sizeConfig.imgAspect"
    >
      <div class="w-full h-full flex items-center justify-center" :class="sizeConfig.imgPad">
        <img
          :src="item.image"
          :alt="item.name"
          class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
          @error="($event.target as HTMLImageElement).closest('div.overflow-hidden')!.style.display = 'none'"
        />
      </div>
    </div>

    <div :class="sizeConfig.card">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h3
            class="font-bold text-gray-900 leading-tight"
            :class="[sizeConfig.title, item.gotten ? 'line-through text-gray-400' : '']"
          >
            {{ item.name }}
          </h3>
          <p v-if="item.description" class="mt-1.5 text-gray-500 leading-snug" :class="priority <= 2 ? 'text-sm' : 'text-xs'">
            {{ item.description }}
          </p>
        </div>
        <div v-if="item.gotten" class="flex-shrink-0">
          <span class="inline-flex items-center gap-1 bg-green-50 text-green-700 rounded-full font-semibold ring-1 ring-green-100" :class="sizeConfig.badge">
            ✓ Received
          </span>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-3">
          <span v-if="formattedPrice" class="font-semibold text-indigo-600" :class="priority <= 2 ? 'text-sm' : 'text-xs'">
            {{ formattedPrice }}
          </span>
          <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors"
            :class="priority <= 2 ? 'text-sm' : 'text-xs'"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View
          </a>
        </div>

        <div v-if="isAdmin" class="flex items-center gap-1.5">
          <button
            class="p-1.5 rounded-lg text-gray-300 hover:text-green-500 hover:bg-green-50 transition-colors"
            :class="item.gotten ? 'text-green-500 bg-green-50' : ''"
            :title="item.gotten ? 'Mark as not received' : 'Mark as received'"
            @click.stop="emit('toggleGotten', item.id)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button class="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors" @click.stop="emit('edit', item)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" @click.stop="emit('delete', item.id)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </component>
</template>
