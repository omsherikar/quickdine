import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { signUp as supabaseSignUp } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  restaurant: any | null
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
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return { error: { message: error.message } }
    }
  },

  signUp: async (email: string, password: string, role: string = 'consumer') => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabaseSignUp(email, password, role)
      if (error) {
        set({ error: error.message, loading: false })
        return { error: { message: error.message } }
      }
      set({ user: data.user, loading: false })
      return { error: null }
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return { error: { message: error.message } }
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, restaurant: null, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  getCurrentUser: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      set({ user, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
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
      set({ error: (error as Error).message, loading: false })
    }
  },
})) 