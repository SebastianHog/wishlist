<script setup lang="ts">
import type { WishlistItem, WishlistList } from '~/types/wishlist'

const props = defineProps<{
  item?: WishlistItem | null
  defaultPriority?: number
  defaultList?: WishlistList
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useWishlistStore()

const form = reactive({
  name: '',
  description: '',
  link: '',
  price: '' as string | number,
  image: '',
  priority: 1,
  list: 'short' as WishlistList,
})

const saving = ref(false)
const error = ref('')

const isEditing = computed(() => !!props.item)
const title = computed(() => isEditing.value ? 'Edit Item' : 'Add Item')

watch(() => props.item, (item) => {
  if (item) {
    form.name = item.name
    form.description = item.description ?? ''
    form.link = item.link ?? ''
    form.price = item.price !== undefined ? item.price : ''
    form.image = item.image ?? ''
    form.priority = item.priority
    form.list = item.list ?? 'short'
  } else {
    form.name = ''
    form.description = ''
    form.link = ''
    form.price = ''
    form.image = ''
    form.priority = props.defaultPriority ?? getNextPriority()
    form.list = props.defaultList ?? 'short'
  }
}, { immediate: true })

function getNextPriority() {
  if (store.priorityGroups.length === 0) return 1
  return store.priorityGroups[store.priorityGroups.length - 1].priority + 1
}

async function save() {
  if (!form.name.trim()) {
    error.value = 'Name is required'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      link: form.link.trim() || undefined,
      price: form.price !== '' ? Number(form.price) : undefined,
      image: form.image.trim() || undefined,
      priority: Number(form.priority) || 1,
      list: form.list,
    }

    if (isEditing.value && props.item) {
      await store.updateItem(props.item.id, data)
    } else {
      await store.addItem(data)
    }

    emit('saved')
    emit('close')
  } catch (e: any) {
    error.value = e.data?.message ?? e.message ?? 'Something went wrong'
  } finally {
    saving.value = false
  }
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      @click="onOverlayClick"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="px-6 py-5 space-y-4" @submit.prevent="save">
          <!-- List picker -->
          <div class="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-semibold">
            <button
              type="button"
              class="flex-1 py-2 transition-colors"
              :class="form.list === 'short' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
              @click="form.list = 'short'"
            >
              🎯 Short Term
            </button>
            <button
              type="button"
              class="flex-1 py-2 transition-colors border-l border-gray-200"
              :class="form.list === 'long' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
              @click="form.list = 'long'"
            >
              🌟 Long Term
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Cozy socks"
              class="w-full rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Any extra details..."
              class="w-full rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Price
                <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr</span>
                <input
                  v-model="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full pl-7 rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                v-model.number="form.priority"
                type="number"
                min="1"
                class="w-full rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Link
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              v-model="form.link"
              type="url"
              placeholder="https://..."
              class="w-full rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              v-model="form.image"
              type="url"
              placeholder="https://..."
              class="w-full rounded-lg border-gray-200 shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div v-if="form.image" class="mt-2 rounded-lg overflow-hidden bg-gray-50 h-24 flex items-center justify-center">
              <img
                :src="form.image"
                class="h-full w-full object-cover"
                alt="Preview"
                @error="($event.target as HTMLImageElement).src = ''"
              />
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>

          <div class="flex gap-3 pt-1">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add item' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
