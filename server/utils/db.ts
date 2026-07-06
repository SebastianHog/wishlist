export interface WishlistItem {
  id: string
  name: string
  description?: string
  link?: string
  price?: number
  image?: string
  priority: number
  gotten: boolean
  list: 'short' | 'long'
  createdAt: string
  updatedAt: string
}

const KEY = 'wishlist'

export async function getItems(): Promise<WishlistItem[]> {
  const storage = useStorage('db')
  return (await storage.getItem<WishlistItem[]>(KEY)) ?? []
}

export async function saveItems(items: WishlistItem[]): Promise<void> {
  const storage = useStorage('db')
  await storage.setItem(KEY, items)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
