import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { signUp as supabaseSignUp } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface Restaurant {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

interface AuthState {
  user: User | null
  restaurant: Restaurant | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: (email: string, password: string, role?: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<void>
  getRestaurant: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  restaurant: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        set({ error: error.message, loading: false })
        return { error: { message: error.message } }
      }
      set({ user: data.user, loading: false })
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
      return { error: { message: errorMessage } }
    }
  },

  signUp: async (email: string, password: string, role = 'consumer') => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabaseSignUp(email, password, role)
      if (error) {
        set({ error: error.message, loading: false })
        return { error: { message: error.message } }
      }
      set({ user: data.user, loading: false })
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
      return { error: { message: errorMessage } }
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, restaurant: null, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
    }
  },

  getCurrentUser: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      set({ user, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
    }
  },

  getRestaurant: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (error) throw error
      set({ restaurant: data, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
    }
  },
})) 