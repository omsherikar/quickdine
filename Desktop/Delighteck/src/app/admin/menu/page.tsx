'use client'

import { useState, useEffect } from 'react'
import { useMenuStore } from '@/store/menuStore'
import { supabase } from '@/lib/supabase'
import Lottie from 'lottie-react'
import { Squares2X2Icon, PencilSquareIcon, TrashIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function AdminMenuPage() {
  const { items, loading, error, fetchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenuStore()
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    restaurant_id: '',
    image_url: null as string | null,
  })

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
      if (error) return
      setRestaurants(data || [])
      if (data && data.length > 0) {
        setRestaurantId(data[0].id)
        setNewItem(prev => ({ ...prev, restaurant_id: data[0].id }))
        fetchMenuItems(data[0].id)
      }
    }
    fetchRestaurants()
  }, [fetchMenuItems])

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems(restaurantId)
      setNewItem(prev => ({ ...prev, restaurant_id: restaurantId }))
    }
  }, [restaurantId, fetchMenuItems])

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRestaurantId(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return

    if (editingItem) {
      await updateMenuItem(editingItem, {
        ...newItem,
        price: parseFloat(newItem.price),
        restaurant_id: restaurantId,
      })
      setEditingItem(null)
    } else {
      await addMenuItem({
        ...newItem,
        price: parseFloat(newItem.price),
        restaurant_id: restaurantId,
      })
    }
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true,
      restaurant_id: restaurantId,
      image_url: null,
    })
  }

  const handleEdit = (item: any) => {
    setEditingItem(item.id)
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      restaurant_id: item.restaurant_id,
      image_url: item.image_url,
    })
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!restaurantId) return <div className="p-4">No restaurant found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526] relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full flex justify-center mb-4">
          <Lottie 
            animationData={require('../../../../public/animations/hero-lottie.json')}
            loop
            style={{ width: 120, height: 120 }}
            className="mx-auto drop-shadow-xl"
            aria-label="Animated admin menu graphic"
          />
        </div>
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-300 text-center drop-shadow flex items-center justify-center gap-2">
          <Squares2X2Icon className="w-8 h-8 text-indigo-300" />Menu Management
        </h1>
        <div className="mb-8">
          <label className="block text-sm font-bold text-indigo-100 mb-1">Select Restaurant</label>
          <select
            value={restaurantId || ''}
            onChange={handleRestaurantChange}
            disabled={restaurants.length === 0}
            className="block w-full max-w-xs rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
          >
            {restaurants.map((rest) => (
              <option key={rest.id} value={rest.id}>{rest.name}</option>
            ))}
          </select>
        </div>

        {/* Menu Item Form */}
        <div className="mb-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
            <PencilSquareIcon className="w-6 h-6" />{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Category</label>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Image URL</label>
              <input
                type="text"
                value={newItem.image_url || ''}
                onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value || null })}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-indigo-100 mb-1">Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                required
              />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={newItem.available}
                onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 bg-white/20"
              />
              <label className="block text-sm font-bold text-indigo-100">Available</label>
              <button
                type="submit"
                className="ml-auto py-3 px-8 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 shadow-lg hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
            <Squares2X2Icon className="w-6 h-6" />Menu Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg hover:bg-white/15 transition-all duration-300">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-white/10 rounded-xl mb-4 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-indigo-300/50" />
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <span className="text-indigo-300 font-bold">₹{item.price}</span>
                </div>
                <p className="text-indigo-100/80 text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-indigo-100/60">{item.category}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`p-2 transition-colors ${
                        item.available ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                      }`}
                    >
                      {item.available ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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