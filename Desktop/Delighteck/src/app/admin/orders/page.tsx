"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClipboardDocumentListIcon, ArrowPathIcon, CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';

const ORDER_STATUSES = ["pending", "preparing", "ready", "delivered"];

export default function AdminOrdersPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all restaurants for the admin
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });
      if (error) return;
      setRestaurants(data || []);
      if (data && data.length > 0) {
        setRestaurantId(data[0].id);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch orders for the selected restaurant
  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurantId) return;
      setLoading(true);
      setError(null);
      let query = supabase
        .from("orders")
        .select("*, order_items(*, menu_items(name))")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) setError(error.message);
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [restaurantId, statusFilter]);

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRestaurantId(e.target.value);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    // Refresh orders
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526] relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-300 text-center drop-shadow flex items-center justify-center gap-2">
          <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-300" />Orders
        </h1>
        {/* Restaurant Selector & Status Filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-bold text-indigo-100 mb-1">Select Restaurant</label>
            <select
              value={restaurantId || ""}
              onChange={handleRestaurantChange}
              disabled={restaurants.length === 0}
              className="block w-full max-w-xs rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
            >
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>{rest.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-indigo-100 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              disabled={!restaurantId}
              className="block w-full max-w-xs rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
            >
              <option value="">All</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
          {loading ? (
            <div className="text-indigo-100/80">Loading orders...</div>
          ) : error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : orders.length === 0 ? (
            <div className="text-indigo-100/80">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Table</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Created</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Items</th>
                    <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/20 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-white font-semibold">{order.id}</td>
                      <td className="px-4 py-3 text-white">{order.table_number}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : order.status === "preparing"
                            ? "bg-blue-500/20 text-blue-300"
                            : order.status === "ready"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}>
                          {order.status === "pending" && <ClockIcon className="w-4 h-4" />}
                          {order.status === "preparing" && <ArrowPathIcon className="w-4 h-4" />}
                          {order.status === "ready" && <CheckCircleIcon className="w-4 h-4" />}
                          {order.status === "delivered" && <TruckIcon className="w-4 h-4" />}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">₹{order.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-indigo-100/80">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <ul className="list-disc pl-4 text-xs text-indigo-100/80">
                          {order.order_items?.map((item: any) => (
                            <li key={item.id}>
                              {item.menu_items?.name || "Item"} x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.filter(s => s !== order.status).map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg font-semibold"
                            >
                              {status === "pending" && <ClockIcon className="w-4 h-4" />}
                              {status === "preparing" && <ArrowPathIcon className="w-4 h-4" />}
                              {status === "ready" && <CheckCircleIcon className="w-4 h-4" />}
                              {status === "delivered" && <TruckIcon className="w-4 h-4" />}
                              Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 