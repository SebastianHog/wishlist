import { defineStore } from 'pinia'
import type { WishlistItem, WishlistList, PriorityGroup, Profile } from '~/types/wishlist'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])
  const profiles = ref<Profile[]>([])
  const activeProfile = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchItems = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await $fetch<WishlistItem[]>('/api/wishlist')
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchProfiles = async () => {
    profiles.value = await $fetch<Profile[]>('/api/profiles')
  }

  const createProfile = async (name: string) => {
    const profile = await $fetch<Profile>('/api/profiles', { method: 'POST', body: { name } })
    profiles.value.push(profile)
    return profile
  }

  const deleteProfile = async (slug: string) => {
    await $fetch(`/api/profiles/${slug}`, { method: 'DELETE' })
    profiles.value = profiles.value.filter(p => p.slug !== slug)
    items.value = items.value.filter(i => i.profile !== slug)
  }

  const addItem = async (data: Omit<WishlistItem, 'id' | 'gotten' | 'createdAt' | 'updatedAt'>) => {
    const item = await $fetch<WishlistItem>('/api/wishlist', { method: 'POST', body: data })
    items.value.push(item)
    return item
  }

  const updateItem = async (id: string, data: Partial<WishlistItem>) => {
    const item = await $fetch<WishlistItem>(`/api/wishlist/${id}`, { method: 'PUT', body: data })
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) items.value[index] = item
    return item
  }

  const deleteItem = async (id: string) => {
    await $fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== id)
  }

  const reorderItems = async (updates: { id: string; priority: number }[]) => {
    await $fetch('/api/wishlist/reorder', { method: 'PUT', body: updates })
    updates.forEach(({ id, priority }) => {
      const item = items.value.find(i => i.id === id)
      if (item) item.priority = priority
    })
  }

  const toggleGotten = async (id: string) => {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    await updateItem(id, { gotten: !item.gotten })
  }

  function priorityGroupsFor(list: WishlistList): PriorityGroup[] {
    const slug = activeProfile.value
    const map = new Map<number, WishlistItem[]>()
    items.value
      .filter(i => !i.gotten && (i.list ?? 'short') === list && (i.profile ?? '') === slug)
      .forEach(item => {
        if (!map.has(item.priority)) map.set(item.priority, [])
        map.get(item.priority)!.push(item)
      })
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([priority, groupItems]) => ({ priority, items: groupItems }))
  }

  const shortTermGroups = computed<PriorityGroup[]>(() => priorityGroupsFor('short'))
  const longTermGroups = computed<PriorityGroup[]>(() => priorityGroupsFor('long'))
  const priorityGroups = shortTermGroups

  const gottenItems = computed(() =>
    items.value.filter(i => i.gotten && (i.profile ?? '') === activeProfile.value),
  )
  const gottenFor = (list: WishlistList) =>
    items.value.filter(i => i.gotten && (i.list ?? 'short') === list && (i.profile ?? '') === activeProfile.value)

  return {
    items,
    profiles,
    activeProfile,
    loading,
    error,
    fetchItems,
    fetchProfiles,
    createProfile,
    deleteProfile,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    toggleGotten,
    priorityGroups,
    shortTermGroups,
    longTermGroups,
    gottenItems,
    gottenFor,
  }
})
