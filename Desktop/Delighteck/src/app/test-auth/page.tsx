'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data.user)
      setLoading(false)
      console.log('TestAuth user:', data.user, error)
    })
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-xl gap-4">
      <div>Supabase user: {user ? JSON.stringify(user) : 'No user'}</div>
      <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Logout</button>
      <button onClick={() => window.location.href = '/login'} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Go to Login</button>
    </div>
  )
} 