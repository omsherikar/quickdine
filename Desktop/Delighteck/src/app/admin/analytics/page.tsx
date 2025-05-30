"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface AnalyticsStats {
  restaurant: string;
  revenue: number;
  orders: number;
  customers: number;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function AdminAnalyticsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | "all">("all");
  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
  const [stats, setStats] = useState<AnalyticsStats[]>([]);
  const [loading, setLoading] = useState(false);

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
    };
    fetchRestaurants();
  }, []);

  // Fetch stats for the selected restaurant(s) and date range
  const fetchStats = async () => {
    setLoading(true);
    const restIds = restaurantId === "all" ? restaurants.map(r => r.id) : [restaurantId];
    const statsArr: AnalyticsStats[] = [];
    for (const restId of restIds) {
      // Revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total")
        .eq("restaurant_id", restId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .eq("status", "completed");
      const revenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;
      // Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id")
        .eq("restaurant_id", restId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      const orders = ordersData?.length || 0;
      // Customers
      const { data: customersData } = await supabase
        .from("orders")
        .select("customer_id")
        .eq("restaurant_id", restId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .not("customer_id", "is", null);
      const customers = new Set(customersData?.map(order => order.customer_id)).size;
      const restName = restaurants.find(r => r.id === restId)?.name || "Unknown";
      statsArr.push({ restaurant: restName, revenue, orders, customers });
    }
    setStats(statsArr);
    setLoading(false);
  };

  // Fetch stats when selection changes
  useEffect(() => {
    if (restaurants.length === 0) return;
    fetchStats();
    // eslint-disable-next-line
  }, [restaurantId, startDate, endDate, restaurants]);

  // Export as CSV
  const exportCSV = () => {
    const header = "Restaurant,Revenue,Orders,Customers\n";
    const rows = stats.map(s => `${s.restaurant},${s.revenue},${s.orders},${s.customers}`).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">Analytics</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
          <select
            value={restaurantId}
            onChange={e => setRestaurantId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map(rest => (
              <option key={rest.id} value={rest.id}>{rest.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={exportCSV}
          className="h-10 px-6 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition"
          disabled={stats.length === 0}
        >
          Export as CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Restaurant</th>
              <th className="px-4 py-2 text-left">Revenue</th>
              <th className="px-4 py-2 text-left">Orders</th>
              <th className="px-4 py-2 text-left">Customers</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6">Loading...</td></tr>
            ) : stats.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No data found.</td></tr>
            ) : (
              stats.map((s, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{s.restaurant}</td>
                  <td className="px-4 py-2">₹{s.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2">{s.orders}</td>
                  <td className="px-4 py-2">{s.customers}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 