import { create } from 'zustand'

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
}

interface MenuStore {
  items: MenuItem[]
  categories: string[]
  addItem: (item: Omit<MenuItem, 'id'>) => void
  updateItem: (id: number, item: Partial<MenuItem>) => void
  removeItem: (id: number) => void
  toggleAvailability: (id: number) => void
  getItemsByCategory: (category: string) => MenuItem[]
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  categories: ['starters', 'mains', 'desserts', 'drinks'],
  addItem: (item) => {
    const newId = Math.max(0, ...get().items.map((i) => i.id)) + 1
    set({ items: [...get().items, { ...item, id: newId }] })
  },
  updateItem: (id, item) => {
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, ...item } : i)),
    })
  },
  removeItem: (id) => {
    set({ items: get().items.filter((item) => item.id !== id) })
  },
  toggleAvailability: (id) => {
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      ),
    })
  },
  getItemsByCategory: (category) => {
    return get().items.filter((item) => item.category === category)
  },
})) 