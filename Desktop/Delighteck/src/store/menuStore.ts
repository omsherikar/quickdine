import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuState {
  items: MenuItem[]
  loading: boolean
  error: string | null
  fetchMenuItems: (restaurantId: string) => Promise<void>
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>
  updateMenuItem: (id: number, item: Partial<MenuItem>) => Promise<void>
  deleteMenuItem: (id: number) => Promise<void>
  toggleAvailability: (id: number, available: boolean) => Promise<void>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchMenuItems: async (restaurantId: string) => {
    set({ loading: true, error: null })
    try {
      console.log('Fetching menu items for restaurant:', restaurantId)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Fetched menu items:', data)
      set({ items: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching menu items:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  addMenuItem: async (item) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()

      if (error) throw error
      if (!data || data.length === 0) throw new Error('No data returned from insert')
      set((state) => ({ items: [...state.items, data[0]], loading: false }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateMenuItem: async (id, item) => {
    set({ loading: true, error: null })
    try {
      // First verify the user's authentication and restaurant ownership
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the menu item to verify restaurant ownership
      const { data: menuItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('restaurant_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Verify restaurant ownership
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', menuItem.restaurant_id)
        .single()

      if (restaurantError) throw restaurantError
      if (restaurant.owner_id !== user.id) throw new Error('Not authorized to update this menu item')

      // Proceed with the update
      const { data, error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', id)
        .select()

      if (error) throw error
      if (!data || data.length === 0) throw new Error('No data returned from update')
      
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? data[0] : i)),
        loading: false,
      }))
    } catch (error) {
      console.error('Error updating menu item:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  deleteMenuItem: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)

      if (error) throw error
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  toggleAvailability: async (id, available) => {
    set({ loading: true, error: null })
    try {
      // First verify the user's authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the menu item to verify restaurant ownership
      const { data: menuItem, error: fetchError } = await supabase
        .from('menu_items')
        .select('restaurant_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching menu item:', fetchError)
        throw fetchError
      }

      // Verify restaurant ownership
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('owner_id')
        .eq('id', menuItem.restaurant_id)
        .single()

      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError)
        throw restaurantError
      }

      if (restaurant.owner_id !== user.id) {
        throw new Error('Not authorized to update this menu item')
      }

      // Proceed with the update
      const { data, error } = await supabase
        .from('menu_items')
        .update({ available })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating menu item:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.error('No data returned from update')
        throw new Error('No data returned from update')
      }

      // Update the local state
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? data[0] : i)),
        loading: false,
      }))
    } catch (error) {
      console.error('Error in toggleAvailability:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },
})) 