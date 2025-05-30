"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { signUp as supabaseSignUp } from '@/lib/auth'
import Lottie from 'lottie-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    let result: { error?: { message: string } | null } = {}
    if (isSignUp) {
      result = await supabaseSignUp(email, password, 'admin') || {}
    } else {
      result = await signIn(email, password) || {}
    }
    if (!result.error) {
      // Wait for the auth state to be updated
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setLocalError('Failed to get user session')
        return
      }
      router.push('/admin')
    } else {
      setLocalError(result.error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526] relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>
      <div className="max-w-md w-full mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 flex flex-col items-center animate-fade-in-up">
          {/* Logo & App Name */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl font-extrabold text-indigo-300 tracking-tight drop-shadow">QuickDine</span>
            <span className="text-sm text-indigo-100/80 font-medium">Admins only. Secure access.</span>
          </div>
          {/* Lottie Animation */}
          <div className="w-full flex justify-center mb-2">
            <Lottie 
              animationData={require('../../../public/animations/hero-lottie.json')}
              loop
              style={{ width: 100, height: 100 }}
              className="mx-auto drop-shadow-xl"
              aria-label="Animated login graphic"
            />
          </div>
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Admin Sign Up' : 'Admin Login'}
          </h2>
          <form className="w-full space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-bold text-indigo-100 mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-indigo-900 placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition disabled:bg-indigo-100/40 disabled:text-indigo-400"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-indigo-100 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-indigo-900 placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition disabled:bg-indigo-100/40 disabled:text-indigo-400"
                  placeholder="Password"
                />
              </div>
            </div>
            {(localError || error) && (
              <div className="text-red-400 text-sm text-center font-semibold">{localError || error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 shadow-lg hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </form>
          <div className="text-center text-sm text-indigo-100/80">
            {isSignUp ? (
              <>
                Already have an admin account?{' '}
                <button
                  type="button"
                  className="text-indigo-300 hover:underline font-semibold"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Need to create an admin account?{' '}
                <button
                  type="button"
                  className="text-indigo-300 hover:underline font-semibold"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
} 