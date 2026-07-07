export type WishlistList = 'short' | 'long'

export interface Profile {
  id: string
  name: string
  slug: string
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
  list: WishlistList
  profile: string
  createdAt: string
  updatedAt: string
}

export interface PriorityGroup {
  priority: number
  items: WishlistItem[]
}
