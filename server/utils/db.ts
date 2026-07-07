export interface Profile {
  id: string
  name: string
  slug: string
  password: string
  createdAt: string
}

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
  profile: string
  createdAt: string
  updatedAt: string
}

const ITEMS_KEY = 'wishlist'
const PROFILES_KEY = 'profiles'

export async function getItems(): Promise<WishlistItem[]> {
  const storage = useStorage('db')
  return (await storage.getItem<WishlistItem[]>(ITEMS_KEY)) ?? []
}

export async function saveItems(items: WishlistItem[]): Promise<void> {
  const storage = useStorage('db')
  await storage.setItem(ITEMS_KEY, items)
}

export async function getProfiles(): Promise<Profile[]> {
  const storage = useStorage('db')
  return (await storage.getItem<Profile[]>(PROFILES_KEY)) ?? []
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  const storage = useStorage('db')
  await storage.setItem(PROFILES_KEY, profiles)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
