<script setup lang="ts">
import type { WishlistItem, WishlistList, PriorityGroup } from '~/types/wishlist'

definePageMeta({
  middleware: 'admin',
})

const store = useWishlistStore()

await useAsyncData('wishlist-admin', () => $fetch('/api/wishlist').then(d => {
  store.items = d as any
  return d
}))

const activeList = ref<WishlistList>('short')
const localGroups = ref<PriorityGroup[]>([])

function syncLocal() {
  const source = activeList.value === 'short' ? store.shortTermGroups : store.longTermGroups
  localGroups.value = source.map(g => ({ priority: g.priority, items: [...g.items] }))
}

syncLocal()
watch(activeList, syncLocal)
watch(() => store.shortTermGroups, () => { if (activeList.value === 'short') syncLocal() }, { deep: true })
watch(() => store.longTermGroups, () => { if (activeList.value === 'long') syncLocal() }, { deep: true })

const draggable = ref()
onMounted(async () => {
  const mod = await import('vuedraggable')
  draggable.value = mod.default
})

const showModal = ref(false)
const editingItem = ref<WishlistItem | null>(null)
const addToPriority = ref<number | undefined>(undefined)
const addToList = ref<WishlistList>('short')
const confirmDeleteId = ref<string | null>(null)
const dragError = ref('')
let dragErrorTimer: ReturnType<typeof setTimeout>

function openAdd(priority?: number) {
  editingItem.value = null
  addToPriority.value = priority
  addToList.value = activeList.value
  showModal.value = true
}

function openEdit(item: WishlistItem) {
  editingItem.value = item
  addToPriority.value = undefined
  showModal.value = true
}

async function onModalSaved() {
  await store.fetchItems()
}

async function handleDelete(id: string) {
  confirmDeleteId.value = id
}

async function confirmDelete() {
  if (!confirmDeleteId.value) return
  await store.deleteItem(confirmDeleteId.value)
  confirmDeleteId.value = null
}

function maxForPriority(priority: number) {
  return priority <= 3 ? 1 : 3
}

function checkMove(evt: any) {
  if (evt.from === evt.to) return true
  const groupEl = evt.to.closest('[data-priority]')
  const targetPriority = groupEl ? parseInt(groupEl.dataset.priority) : 99
  const max = maxForPriority(targetPriority)
  const currentCount = evt.to.children.length
  if (currentCount >= max) {
    showDragError(
      targetPriority <= 3
        ? `Spot #${targetPriority} can only hold 1 item`
        : 'Max 3 items per priority slot!'
    )
    return false
  }
  return true
}

function showDragError(msg: string) {
  dragError.value = msg
  clearTimeout(dragErrorTimer)
  dragErrorTimer = setTimeout(() => { dragError.value = '' }, 3000)
}

async function onGroupItemChange(groupPriority: number, evt: any) {
  if (!evt.added) return
  const item = evt.added.element as WishlistItem
  if (item.priority === groupPriority) return
  await store.updateItem(item.id, { priority: groupPriority })
  await store.fetchItems()
}

async function onGroupsReorder() {
  const updates: { id: string; priority: number }[] = []
  localGroups.value.forEach((group, idx) => {
    const newPriority = idx + 1
    group.items.forEach(item => {
      updates.push({ id: item.id, priority: newPriority })
    })
  })
  await store.reorderItems(updates)
  await store.fetchItems()
}

function addPrioritySlot() {
  const nextP = localGroups.value.length > 0
    ? localGroups.value[localGroups.value.length - 1].priority + 1
    : 1
  openAdd(nextP)
}

const currentGottenItems = computed(() => store.gottenFor(activeList.value))

const shortCount = computed(() => store.shortTermGroups.reduce((n, g) => n + g.items.length, 0))
const longCount = computed(() => store.longTermGroups.reduce((n, g) => n + g.items.length, 0))
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-500 text-sm mt-0.5">Drag items between priority groups to reorder</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          View wishlist
        </NuxtLink>
        <button
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          @click="openAdd()"
        >
          + Add item
        </button>
      </div>
    </div>

    <!-- List tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
      <button
        class="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="activeList === 'short'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeList = 'short'"
      >
        🎯 Short Term
        <span v-if="shortCount > 0" class="ml-1.5 text-xs font-medium text-gray-400">{{ shortCount }}</span>
      </button>
      <button
        class="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="activeList === 'long'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeList = 'long'"
      >
        🌟 Long Term
        <span v-if="longCount > 0" class="ml-1.5 text-xs font-medium text-gray-400">{{ longCount }}</span>
      </button>
    </div>

    <Transition name="slide-down">
      <div
        v-if="dragError"
        class="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
      >
        {{ dragError }}
      </div>
    </Transition>

    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <ClientOnly>
        <component
          :is="draggable"
          v-if="draggable"
          :key="activeList"
          v-model="localGroups"
          item-key="priority"
          handle=".group-drag-handle"
          animation="250"
          ghost-class="opacity-40"
          @end="onGroupsReorder"
        >
          <template #item="{ element: group }">
            <div class="mb-6">
              <div class="flex items-center gap-3 mb-3">
                <div class="group-drag-handle flex items-center gap-2 cursor-grab active:cursor-grabbing select-none">
                  <svg class="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                  </svg>
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                    :class="{
                      'bg-yellow-400 text-yellow-900 !w-9 !h-9 text-base': group.priority === 1,
                      'bg-gray-300 text-gray-700': group.priority === 2,
                      'bg-amber-600 text-amber-100': group.priority === 3,
                      'bg-indigo-100 text-indigo-600': group.priority > 3,
                    }"
                  >
                    #{{ group.priority }}
                  </span>
                  <span class="text-sm text-gray-400">
                    {{ group.items.length }}/{{ maxForPriority(group.priority) }} items
                  </span>
                </div>
                <div class="h-px flex-1 bg-gray-100"></div>
                <button
                  v-if="group.items.length < maxForPriority(group.priority)"
                  class="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  @click="openAdd(group.priority)"
                >
                  + Add here
                </button>
              </div>

              <div :data-priority="group.priority">
                <component
                  :is="draggable"
                  v-model="group.items"
                  item-key="id"
                  :group="`wishlist-${activeList}-items`"
                  animation="200"
                  ghost-class="opacity-40"
                  drag-class="rotate-1 shadow-xl"
                  :move="checkMove"
                  @change="onGroupItemChange(group.priority, $event)"
                >
                  <template #item="{ element: item }">
                    <div class="mb-2 cursor-grab active:cursor-grabbing">
                      <WishlistItem
                        :item="item"
                        :priority="group.priority"
                        is-admin
                        @edit="openEdit"
                        @delete="handleDelete"
                        @toggle-gotten="store.toggleGotten"
                      />
                    </div>
                  </template>
                </component>
              </div>

              <div
                v-if="group.items.length === 0"
                class="border-2 border-dashed border-gray-200 rounded-2xl h-16 flex items-center justify-center text-gray-400 text-sm"
              >
                Drop items here
              </div>
            </div>
          </template>
        </component>

        <template #fallback>
          <div v-for="group in localGroups" :key="group.priority" class="mb-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                #{{ group.priority }}
              </span>
              <div class="h-px flex-1 bg-gray-100"></div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <WishlistItem
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                :priority="group.priority"
                is-admin
                @edit="openEdit"
                @delete="handleDelete"
                @toggle-gotten="store.toggleGotten"
              />
            </div>
          </div>
        </template>
      </ClientOnly>

      <div
        v-if="localGroups.length === 0"
        class="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl"
      >
        <div class="text-5xl mb-4">{{ activeList === 'short' ? '🎯' : '🌟' }}</div>
        <p class="text-lg font-semibold text-gray-600">
          No {{ activeList === 'short' ? 'short term' : 'long term' }} items yet
        </p>
        <p class="text-gray-400 text-sm mt-1 mb-6">Add your first item to this list</p>
        <button
          class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
          @click="openAdd()"
        >
          Add first item
        </button>
      </div>

      <button
        v-if="localGroups.length > 0"
        class="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-colors"
        @click="addPrioritySlot"
      >
        + Add new priority slot
      </button>

      <template v-if="currentGottenItems.length > 0">
        <div class="mt-12 pt-8 border-t border-gray-100">
          <h2 class="text-base font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <span>✓</span> Received / Fulfilled ({{ currentGottenItems.length }})
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <WishlistItem
              v-for="item in currentGottenItems"
              :key="item.id"
              :item="item"
              :priority="99"
              is-admin
              @edit="openEdit"
              @delete="handleDelete"
              @toggle-gotten="store.toggleGotten"
            />
          </div>
        </div>
      </template>
    </template>

    <ItemFormModal
      v-if="showModal"
      :item="editingItem"
      :default-priority="addToPriority"
      :default-list="addToList"
      @close="showModal = false"
      @saved="onModalSaved"
    />

    <Teleport to="body">
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="confirmDeleteId = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="text-4xl mb-3">🗑️</div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">Delete item?</h3>
          <p class="text-sm text-gray-500 mb-6">This cannot be undone.</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              @click="confirmDeleteId = null"
            >
              Cancel
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
