import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

export async function signUp(email: string, password: string, role: string = 'consumer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (data?.user) {
    // Create profile with role
    await createProfile(data.user.id, role)
  }
  return { data, error }
}

export async function createProfile(userId: string, role: string) {
  return await supabase.from('profiles').insert({ id: userId, role })
}

export async function getProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { data: null, error: userError }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function createRestaurant(name: string, description: string | null = null) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name,
      description,
      owner_id: user.id,
    })
    .select()
    .single()

  return { data, error }
}

export async function getRestaurantByOwner() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return { data, error }
}

export async function updateProfileRole(userId: string, role: 'admin' | 'consumer') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
} 