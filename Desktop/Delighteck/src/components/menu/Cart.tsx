import { useCartStore } from '@/store/cart'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const items = useCartStore(state => state.items)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payLaterLoading, setPayLaterLoading] = useState(false)
  const [payLaterSuccess, setPayLaterSuccess] = useState(false)
  const [payLaterError, setPayLaterError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant')
  const tableId = searchParams.get('table')
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [customerError, setCustomerError] = useState<string | null>(null)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleCheckout = async () => {
    if (!tableId) {
      setError('Table number is required. Please scan the QR code at your table.');
      return;
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      
      if (!data.orderId) {
        throw new Error(data.error || 'Failed to create order')
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'QuickDine',
        description: 'Restaurant Order Payment',
        order_id: data.orderId,
        handler: function (response: any) {
          // Handle successful payment
          console.log('Payment successful:', response)
          // Redirect to success page with payment details
          window.location.href = `/payment/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#4F46E5' // Indigo color matching your theme
        },
        modal: {
          ondismiss: function() {
            // Handle when user closes the payment modal
            window.location.href = '/payment/failure?reason=cancelled'
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to get or create customer
  const getOrCreateCustomer = async (name: string, mobile: string) => {
    // Try to find existing customer
    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('id')
      .eq('mobile', mobile)
      .single();
    if (existing) return existing.id;
    // If not found, create new
    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert([{ name, mobile }])
      .select('id')
      .single();
    if (createError) throw createError;
    return created.id;
  };

  const handlePayLater = async () => {
    if (!tableId) {
      setPayLaterError('Table number is required. Please scan the QR code at your table.');
      setPayLaterLoading(false);
      return;
    }
    if (!customerName.trim() || !customerMobile.trim()) {
      setCustomerError('Name and mobile number are required.');
      setPayLaterLoading(false);
      return;
    }
    setPayLaterLoading(true)
    setPayLaterError(null)
    setCustomerError(null)
    try {
      // Get or create customer
      const customer_id = await getOrCreateCustomer(customerName.trim(), customerMobile.trim());
      // Place order in Supabase with status 'pending' and payment_method 'pay_later'
      const { data, error } = await supabase.from('orders').insert([
        {
          status: 'pending',
          total: total,
          restaurant_id: restaurantId,
          customer_id,
          table_number: tableId ? parseInt(tableId) : null,
          payment_method: 'pay_later',
        },
      ]).select().single()
      if (error) throw error
      // Insert order items
      const orderId = data.id
      const orderItems = items.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError
      removeItem(items[0].id)
      setPayLaterSuccess(true)
    } catch (err: any) {
      setPayLaterError(err.message || 'Failed to place order.')
    } finally {
      setPayLaterLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart</h2>
        <p className="text-gray-500 text-sm">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-white/20">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cart</h2>
      {/* Customer Info Form */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow-inner">
        <label className="block text-base font-semibold text-gray-800 mb-1">Name</label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          className="w-full rounded-md border-2 border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 text-lg px-4 py-2 mb-3 bg-white placeholder-gray-400"
          placeholder="Enter your name"
          autoComplete="name"
        />
        <label className="block text-base font-semibold text-gray-800 mb-1">Mobile Number</label>
        <input
          type="tel"
          value={customerMobile}
          onChange={e => setCustomerMobile(e.target.value)}
          className="w-full rounded-md border-2 border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 text-lg px-4 py-2 bg-white placeholder-gray-400"
          placeholder="Enter your mobile number"
          autoComplete="tel"
        />
        {customerError && <div className="text-red-600 text-base mt-2 font-semibold">{customerError}</div>}
      </div>
      <div className="flow-root">
        <ul role="list" className="-my-6 divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex py-6">
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <h3>{item.name}</h3>
                  <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center mt-2 gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="text-gray-700 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
                {item.notes && (
                  <p className="mt-1 text-xs text-gray-500">Note: {item.notes}</p>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                  aria-label="Remove item"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-base font-semibold text-gray-900">
          <p>Subtotal</p>
          <p>₹{total.toFixed(2)}</p>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Taxes and service charges calculated at checkout.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={handlePayLater}
            disabled={payLaterLoading || items.length === 0}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold text-lg shadow hover:bg-gray-900 transition disabled:opacity-50"
          >
            {payLaterLoading ? 'Placing Order...' : 'Pay Later'}
          </button>
          {payLaterSuccess && (
            <div className="mt-4 text-green-600 font-semibold text-center">
              Order placed! Please pay at the counter or with your server.<br />
              <button
                className="mt-2 underline text-indigo-600"
                onClick={() => router.push(`/menu?restaurant=${restaurantId}&table=${tableId}`)}
              >
                Back to Menu
              </button>
            </div>
          )}
          {payLaterError && (
            <div className="mt-2 text-red-600 text-center">{payLaterError}</div>
          )}
        </div>
      </div>
    </div>
  )
} 