'use client'
import Link from 'next/link';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/navigation';
import { ChartBarIcon, UserGroupIcon, CurrencyRupeeIcon, TableCellsIcon, BuildingStorefrontIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function addOneDay(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

export default function AdminDashboard() {
  // Table management state
  const [tables, setTables] = useState<any[]>([]);
  const [tableName, setTableName] = useState('');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Restaurant management state
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  const [stats, setStats] = useState({
    todayRevenue: 0,
    todaysOrders: 0,
    totalCustomers: 0,
  });

  // --- Analytics Panel State ---
  const [analyticsRestaurants, setAnalyticsRestaurants] = useState<any[]>([]);
  const [analyticsRestaurantId, setAnalyticsRestaurantId] = useState<string | 'all'>('all');
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>(formatDate(new Date()));
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>(formatDate(new Date()));
  const [analyticsStats, setAnalyticsStats] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          router.push('/login');
          return;
        }
        setAuthUser(user);
        setUser(user);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch restaurantId and tables
  useEffect(() => {
    const fetchRestaurantAndTables = async () => {
      setLoadingTables(true);
      setTableError(null);
      try {
        const { data: restaurants, error: restError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id);
        if (restError) throw restError;
        if (!restaurants || restaurants.length === 0) throw new Error('No restaurant found');
        // Don't set default restaurant ID here anymore
        setRestaurantId(null);
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .order('created_at', { ascending: true });
        if (tablesError) throw tablesError;
        setTables(tablesData || []);
      } catch (err: any) {
        setTableError(err.message || 'Error loading tables');
      } finally {
        setLoadingTables(false);
      }
    };
    fetchRestaurantAndTables();
  }, [user]);

  // Add effect to fetch tables when restaurantId changes
  useEffect(() => {
    const fetchTablesForRestaurant = async () => {
      if (!restaurantId) {
        setTables([]);
        return;
      }
      setLoadingTables(true);
      setTableError(null);
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: true });
        if (tablesError) throw tablesError;
        setTables(tablesData || []);
      } catch (err: any) {
        setTableError(err.message || 'Error loading tables');
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTablesForRestaurant();
  }, [restaurantId]);

  // Fetch restaurants for the current user
  useEffect(() => {
    if (!user) return;
    setLoadingRestaurants(true);
    setRestaurantError(null);
    supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setRestaurantError(error.message);
        setRestaurants(data || []);
        setLoadingRestaurants(false);
      });
  }, [user]);

  // Fetch stats for the selected restaurant
  const fetchStats = async (restaurantId: string) => {
    if (!restaurantId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Fetch today's revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', today.toISOString())
      .eq('status', 'completed');
    const todayRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    // Fetch today's delivered orders
    const { data: deliveredOrdersData } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', today.toISOString())
      .eq('status', 'delivered');
    const todaysOrders = deliveredOrdersData?.length || 0;
    // Fetch total customers (unique customer_id)
    const { data: customersData } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('restaurant_id', restaurantId)
      .not('customer_id', 'is', null);
    const totalCustomers = new Set(customersData?.map(order => order.customer_id)).size;
    setStats({ todayRevenue, todaysOrders, totalCustomers });
  };

  // Real-time updates for orders
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel('orders_stats')
      .on(
        'postgres_changes',
        {
          event: '*', // listen to all events (insert, update, delete)
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => fetchStats(restaurantId)
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [restaurantId]);

  // Add new table
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !tableName.trim()) return;
    setLoadingTables(true);
    setTableError(null);
    try {
      const { error } = await supabase
        .from('tables')
        .insert([{ name: tableName.trim(), restaurant_id: restaurantId }]);
      if (error) throw error;
      setTableName('');
      // Refresh tables for the current restaurant only
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });
      if (tablesError) throw tablesError;
      setTables(tablesData || []);
    } catch (err: any) {
      setTableError(err.message || 'Error adding table');
    } finally {
      setLoadingTables(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (id: string) => {
    if (!restaurantId) return;
    setLoadingTables(true);
    setTableError(null);
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId); // Add restaurant_id check
      if (error) throw error;
      // Refresh tables for the current restaurant only
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });
      if (tablesError) throw tablesError;
      setTables(tablesData || []);
    } catch (err: any) {
      setTableError(err.message || 'Error deleting table');
    } finally {
      setLoadingTables(false);
    }
  };

  // Add new restaurant
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRestaurants(true);
    setRestaurantError(null);
    try {
      const { error } = await supabase
        .from('restaurants')
        .insert([{ name: restaurantName.trim(), description: restaurantDescription.trim(), owner_id: user.id }]);
      if (error) throw error;
      setRestaurantName('');
      setRestaurantDescription('');
      // Refresh restaurants
      const { data: restData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });
      setRestaurants(restData || []);
    } catch (err: any) {
      setRestaurantError(err.message || 'Error adding restaurant');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Fetch all restaurants for analytics panel
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });
      if (error) return;
      setAnalyticsRestaurants(data || []);
    };
    fetchRestaurants();
  }, []);

  // Fetch stats for the selected restaurant(s) and date range
  const fetchAnalyticsStats = async () => {
    setAnalyticsLoading(true);
    let restIds = analyticsRestaurantId === 'all' ? analyticsRestaurants.map(r => r.id) : [analyticsRestaurantId];
    let statsArr = [];
    const inclusiveEndDate = addOneDay(analyticsEndDate);
    for (const restId of restIds) {
      // Revenue (delivered or completed)
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restId)
        .gte('created_at', analyticsStartDate)
        .lt('created_at', inclusiveEndDate)
        .in('status', ['completed', 'delivered']);
      const revenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;
      // Orders (all statuses)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restId)
        .gte('created_at', analyticsStartDate)
        .lt('created_at', inclusiveEndDate);
      const orders = ordersData?.length || 0;
      // Customers
      const { data: customersData } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('restaurant_id', restId)
        .gte('created_at', analyticsStartDate)
        .lt('created_at', inclusiveEndDate)
        .not('customer_id', 'is', null);
      const customers = new Set(customersData?.map(order => order.customer_id)).size;
      const restName = analyticsRestaurants.find(r => r.id === restId)?.name || 'Unknown';
      statsArr.push({ restaurant: restName, revenue, orders, customers });
    }
    setAnalyticsStats(statsArr);
    setAnalyticsLoading(false);
  };

  // Fetch stats when selection changes
  useEffect(() => {
    if (analyticsRestaurants.length === 0) return;
    fetchAnalyticsStats();
    // eslint-disable-next-line
  }, [analyticsRestaurantId, analyticsStartDate, analyticsEndDate, analyticsRestaurants]);

  // Export as CSV
  const exportAnalyticsCSV = () => {
    const header = 'Restaurant,Revenue,Orders,Customers\n';
    const rows = analyticsStats.map(s => `${s.restaurant},${s.revenue},${s.orders},${s.customers}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${analyticsStartDate}_to_${analyticsEndDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add this to get the admin's name
  const adminName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl gap-4">
        <div>No user session found. Please log in again.</div>
        <button onClick={() => router.push('/login')} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#232526] via-[#18181b] to-[#232526] relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="w-8 h-8 text-indigo-300" />
              <span className="text-2xl font-extrabold text-indigo-300 tracking-tight">QuickDine Admin</span>
            </div>
            <div className="flex gap-6 text-base font-medium">
              <Link href="/admin/menu" className="flex items-center gap-1 text-indigo-100 hover:text-indigo-300 transition">
                <TableCellsIcon className="w-5 h-5" />Menu
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-1 text-indigo-100 hover:text-indigo-300 transition">
                <ChartBarIcon className="w-5 h-5" />Orders
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-1 text-indigo-100 hover:text-indigo-300 transition">
                <Cog6ToothIcon className="w-5 h-5" />Settings
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500/20 text-red-200 px-4 py-2 rounded-xl hover:bg-red-500/30 transition font-medium"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full flex justify-center mb-4">
          <Lottie 
            animationData={require('../../../public/animations/hero-lottie.json')}
            loop
            style={{ width: 140, height: 140 }}
            className="mx-auto drop-shadow-xl"
            aria-label="Animated admin graphic"
          />
        </div>
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-300 text-center drop-shadow">Welcome, {adminName}!</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 flex flex-col items-center hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-indigo-500/20 rounded-xl mb-2">
              <CurrencyRupeeIcon className="w-8 h-8 text-indigo-300" />
            </div>
            <div className="text-2xl font-bold text-white">₹{stats.todayRevenue.toLocaleString()}</div>
            <div className="text-indigo-100/80 mt-1">Today's Revenue</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 flex flex-col items-center hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-pink-500/20 rounded-xl mb-2">
              <ChartBarIcon className="w-8 h-8 text-pink-300" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.todaysOrders}</div>
            <div className="text-indigo-100/80 mt-1">Today's Orders</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 flex flex-col items-center hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-yellow-500/20 rounded-xl mb-2">
              <UserGroupIcon className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
            <div className="text-indigo-100/80 mt-1">Total Customers</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/menu" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 text-center font-semibold hover:bg-white/15 transition-all duration-200 group">
            <div className="p-3 bg-indigo-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:bg-indigo-500/30 transition-all duration-200">
              <TableCellsIcon className="w-8 h-8 text-indigo-300" />
            </div>
            <span className="text-lg text-white">Manage Menu</span>
          </Link>
          <Link href="/admin/orders" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 text-center font-semibold hover:bg-white/15 transition-all duration-200 group">
            <div className="p-3 bg-pink-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:bg-pink-500/30 transition-all duration-200">
              <ChartBarIcon className="w-8 h-8 text-pink-300" />
            </div>
            <span className="text-lg text-white">View Orders</span>
          </Link>
          <Link href="/admin/settings" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 text-center font-semibold hover:bg-white/15 transition-all duration-200 group">
            <div className="p-3 bg-yellow-500/20 rounded-xl mx-auto mb-4 w-fit group-hover:bg-yellow-500/30 transition-all duration-200">
              <Cog6ToothIcon className="w-8 h-8 text-yellow-300" />
            </div>
            <span className="text-lg text-white">Settings</span>
          </Link>
        </div>

        {/* Restaurants Section */}
        <div className="mb-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-6 h-6" />Your Restaurants
          </h2>
          <button
            onClick={() => setShowAddRestaurant((v) => !v)}
            className="mb-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          >
            {showAddRestaurant ? 'Hide Add Restaurant Form' : 'Add New Restaurant'}
          </button>
          {restaurantError && <div className="text-red-400 mb-2">{restaurantError}</div>}
          {loadingRestaurants ? (
            <div className="text-indigo-100/80">Loading restaurants...</div>
          ) : (
            <>
              {showAddRestaurant && (
                <form onSubmit={handleAddRestaurant} className="space-y-4 mb-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-bold text-indigo-100 mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={e => setRestaurantName(e.target.value)}
                      className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-indigo-100 mb-1">Description</label>
                    <textarea
                      value={restaurantDescription}
                      onChange={e => setRestaurantDescription(e.target.value)}
                      className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                    disabled={loadingRestaurants}
                  >
                    Add Restaurant
                  </button>
                </form>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map((rest: any) => (
                  <div key={rest.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/15 transition-all duration-200">
                    <div className="font-semibold text-lg text-white mb-1">{rest.name}</div>
                    <div className="text-indigo-100/80 mb-2">{rest.description}</div>
                    <div className="text-xs text-indigo-100/60">ID: {rest.id}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Manage Tables Section */}
        <div className="mt-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300 flex items-center gap-2">
            <TableCellsIcon className="w-6 h-6" />Manage Tables
          </h2>
          {/* Restaurant Selector */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-indigo-100 mb-2">Select Restaurant</label>
            <select
              value={restaurantId || ''}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="block w-full max-w-xs rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name}
                </option>
              ))}
            </select>
          </div>
          {restaurantId ? (
            <>
              <form onSubmit={handleAddTable} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                  placeholder="Table name or number"
                  className="flex-1 rounded-xl border border-indigo-300 bg-white/20 text-white placeholder-indigo-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                  disabled={loadingTables}
                >
                  Add Table
                </button>
              </form>
              {tableError && <div className="text-red-400 mb-2">{tableError}</div>}
              {loadingTables ? (
                <div className="text-indigo-100/80">Loading tables...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table: any) => (
                    <div key={table.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col items-center shadow-lg hover:bg-white/15 transition-all duration-200">
                      <div className="font-semibold text-white mb-2">{table.name}</div>
                      <QRCode
                        value={`${window.location.origin}/menu?restaurant=${restaurantId}&table=${table.id}`}
                        size={128}
                        bgColor="#fff"
                        fgColor="#000"
                      />
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="mt-3 text-red-400 hover:text-red-300 text-sm transition-colors"
                        disabled={loadingTables}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-indigo-100/80 text-center py-4">
              Please select a restaurant to manage its tables
            </div>
          )}
        </div>

        {/* Analytics Panel */}
        <div className="mt-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />Analytics
          </h2>
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Restaurant</label>
              <select
                value={analyticsRestaurantId}
                onChange={e => setAnalyticsRestaurantId(e.target.value)}
                className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
              >
                <option value="all">All Restaurants</option>
                {analyticsRestaurants.map(rest => (
                  <option key={rest.id} value={rest.id}>{rest.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">Start Date</label>
              <input
                type="date"
                value={analyticsStartDate}
                onChange={e => setAnalyticsStartDate(e.target.value)}
                className="rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-100 mb-1">End Date</label>
              <input
                type="date"
                value={analyticsEndDate}
                onChange={e => setAnalyticsEndDate(e.target.value)}
                className="rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
              />
            </div>
            <button
              onClick={exportAnalyticsCSV}
              className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={analyticsStats.length === 0}
            >
              Export as CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Restaurant</th>
                  <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left text-indigo-100 font-semibold">Customers</th>
                </tr>
              </thead>
              <tbody>
                {analyticsLoading ? (
                  <tr><td colSpan={4} className="text-center py-6 text-indigo-100/80">Loading...</td></tr>
                ) : analyticsStats.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-indigo-100/80">No data found.</td></tr>
                ) : (
                  analyticsStats.map((s, i) => (
                    <tr key={i} className="border-b border-white/20 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-semibold">{s.restaurant}</td>
                      <td className="px-4 py-3 text-white font-semibold">₹{s.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-white font-semibold">{s.orders}</td>
                      <td className="px-4 py-3 text-white font-semibold">{s.customers}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 