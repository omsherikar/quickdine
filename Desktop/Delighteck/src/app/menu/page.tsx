'use client'

import { useState, useEffect, useRef } from 'react'
import { useMenuStore } from '@/store/menuStore'
import { useCartStore } from '@/store/cart'
import Cart from '@/components/menu/Cart'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronDownIcon, BuildingStorefrontIcon, Squares2X2Icon, ShoppingCartIcon } from '@heroicons/react/24/outline'

export default function MenuPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const restaurantId = searchParams.get('restaurant')
  const tableId = searchParams.get('table')
  
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items, loading: menuLoading, error: menuError, fetchMenuItems } = useMenuStore()
  const { addItem } = useCartStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('name')

        if (error) throw error
        setRestaurants(data || [])
      } catch (err: any) {
        console.error('Error fetching restaurants:', err)
      }
    }

    fetchRestaurants()
  }, [])

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single()

        if (error) throw error
        setRestaurant(data)
        
        // Fetch menu items for this restaurant
        await fetchMenuItems(restaurantId)
        
        // Set initial category if items exist
        if (items.length > 0) {
          setSelectedCategory(items[0].category)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [restaurantId, fetchMenuItems])

  // Get unique categories from menu items
  const categories = [...new Set(items.map(item => item.category))]

  // Filtered restaurants by search
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleRestaurantSelect = (selectedRestaurant: any) => {
    router.push(`/menu?restaurant=${selectedRestaurant.id}`)
    setShowRestaurantDropdown(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRestaurantDropdown(false)
      }
    }
    if (showRestaurantDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showRestaurantDropdown])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading restaurant menu...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-red-600">Error: {error}</div>
    </div>
  )

  // Show restaurant selector if no restaurant is selected and not accessed through QR code
  if (!restaurant && !restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Restaurant</h1>
            <p className="text-gray-600">Choose a restaurant to view their menu</p>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <span className="text-gray-700">Select Restaurant</span>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>

            {showRestaurantDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 space-y-2 max-h-96 overflow-y-auto animate-fade-in">
                {/* Search box */}
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-gray-50"
                  autoFocus
                />
                {filteredRestaurants.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No restaurants found</div>
                ) :
                  filteredRestaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => handleRestaurantSelect(restaurant)}
                      className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100 transition"
                    >
                      {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">{restaurant.name.charAt(0)}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{restaurant.name}</div>
                        {restaurant.description && (
                          <div className="text-sm text-gray-500 truncate">{restaurant.description}</div>
                        )}
                      </div>
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Or scan a QR code from your table to view the menu</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526] relative overflow-hidden py-0 sm:py-10 px-0 sm:px-4">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>
      <div className="max-w-5xl mx-auto">
        {/* Restaurant Info Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 mb-8">
          {restaurant?.logo_url && (
            <img src={restaurant.logo_url} alt="Restaurant Logo" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200 shadow" />
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-indigo-200 mb-1 drop-shadow flex items-center gap-2 justify-center sm:justify-start"><BuildingStorefrontIcon className="w-7 h-7 text-indigo-300" />{restaurant?.name}</h1>
            <p className="text-indigo-100/80 text-sm max-w-xl mx-auto sm:mx-0">{restaurant?.description}</p>
            {tableId && (
              <p className="text-indigo-100/60 text-sm mt-2">Table: {tableId}</p>
            )}
          </div>
        </div>
        {/* Category Tabs */}
        <div className="mb-8 flex justify-center">
          <nav className="flex flex-wrap gap-2 sm:gap-4" aria-label="Tabs">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full font-semibold text-sm shadow transition backdrop-blur-md
                  ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-indigo-200 hover:bg-indigo-500/20 hover:text-white'
                  }
                `}
              >
                <Squares2X2Icon className="w-4 h-4 inline-block mr-1" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {menuLoading ? (
              <div className="text-center text-indigo-100/80">Loading menu items...</div>
            ) : menuError ? (
              <div className="text-center text-red-400">Error: {menuError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items
                  .filter(item => item.category === selectedCategory && item.available)
                  .map((item) => (
                    <div key={item.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 hover:bg-white/20 transition-all duration-300 group">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-xl mb-4 border border-indigo-200 group-hover:brightness-110 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-indigo-900/20 rounded-xl mb-4 border border-indigo-200 text-indigo-300"><Squares2X2Icon className="w-12 h-12" /></div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition">{item.name}</h3>
                          <p className="mt-1 text-sm text-indigo-100/80 group-hover:text-white transition">{item.description}</p>
                          <p className="mt-2 text-lg font-semibold text-indigo-300">₹{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => addItem(item)}
                          className="ml-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition flex items-center gap-1"
                        >
                          <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-indigo-200 flex items-center gap-2"><ShoppingCartIcon className="w-6 h-6" />Your Cart</h2>
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 