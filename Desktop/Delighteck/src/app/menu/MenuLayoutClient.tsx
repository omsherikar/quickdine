'use client'

import { useSearchParams } from 'next/navigation'

export default function MenuLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant')
  const tableId = searchParams.get('table')

  // If accessed through QR code (has restaurant and table params), use the minimal layout
  if (restaurantId && tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18181b] to-[#232526]">
        <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    )
  }

  // If accessed normally (no QR code), use the main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] to-[#232526] relative overflow-x-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-60px] left-[-60px] w-56 h-56 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8">
        <div className="bg-white/5 rounded-2xl shadow-xl p-6 sm:p-10 min-h-[70vh]">
          {children}
        </div>
      </main>
    </div>
  )
} 