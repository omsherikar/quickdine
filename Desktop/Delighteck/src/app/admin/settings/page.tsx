"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import { Cog6ToothIcon, UserCircleIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, ArrowRightOnRectangleIcon, ArrowPathIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showDeleteRestaurantConfirm, setShowDeleteRestaurantConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Fetch user, profile, and restaurants
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (!user) throw new Error("No user");
        // Fetch profile (if you have a profiles table)
        let profileData = { email: user.email };
        // Fetch restaurants
        const { data: restData, error: restError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true });
        if (restError) throw restError;
        setRestaurants(restData || []);
        if (restData && restData.length > 0) {
          setRestaurantId(restData[0].id);
          setRestaurant(restData[0]);
        }
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When restaurantId changes, update restaurant info
  useEffect(() => {
    if (!restaurantId) return;
    const rest = restaurants.find(r => r.id === restaurantId);
    if (rest) setRestaurant(rest);
  }, [restaurantId, restaurants]);

  useEffect(() => {
    if (user && user.user_metadata && user.user_metadata.name) {
      setName(user.user_metadata.name);
    }
  }, [user]);

  // Handle profile update (email only for now)
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle restaurant info update
  const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRestaurant({ ...restaurant, [e.target.name]: e.target.value });
  };

  // Handle name update
  const handleNameSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const { error: profileError } = await supabase.auth.updateUser({ data: { name } });
      if (profileError) throw profileError;
      setSuccess('Name updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setError(null);
    try {
      // You may need to call a Supabase edge function or admin API to delete user
      setSuccess('Account deleted (simulate).');
      setShowDeleteAccountConfirm(false);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Handle delete restaurant
  const handleDeleteRestaurant = async () => {
    setDeletingRestaurant(true);
    setError(null);
    try {
      await supabase.from('restaurants').delete().eq('id', restaurantId);
      setSuccess('Restaurant deleted.');
      setShowDeleteRestaurantConfirm(false);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to delete restaurant');
    } finally {
      setDeletingRestaurant(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      // Update restaurant info
      if (restaurantId) {
        const { error: restError } = await supabase
          .from("restaurants")
          .update({
            name: restaurant.name,
            description: restaurant.description,
            logo_url: restaurant.logo_url,
          })
          .eq("id", restaurantId);
        if (restError) throw restError;
      }
      setSuccess("Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
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
          <Cog6ToothIcon className="w-8 h-8 text-indigo-300" />Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
              <UserCircleIcon className="w-6 h-6" /> Profile Settings
            </h2>
            <form onSubmit={handleNameSave} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleProfileChange}
                  disabled
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Restaurant Settings */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-6 h-6" /> Restaurant Settings
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Dropdown to select restaurant */}
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Select Restaurant</label>
                <select
                  value={restaurantId || ''}
                  onChange={e => setRestaurantId(e.target.value)}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                >
                  {restaurants.map((rest: any) => (
                    <option key={rest.id} value={rest.id}>{rest.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  value={restaurant.name || ''}
                  onChange={handleRestaurantChange}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Description</label>
                <textarea
                  name="description"
                  value={restaurant.description || ''}
                  onChange={handleRestaurantChange}
                  rows={3}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-100 mb-1">Logo URL</label>
                <input
                  type="text"
                  name="logo_url"
                  value={restaurant.logo_url || ''}
                  onChange={handleRestaurantChange}
                  className="block w-full rounded-xl border border-indigo-300 bg-white/20 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base shadow-sm backdrop-blur-md transition"
                  placeholder="https://..."
                />
                {restaurant.logo_url && (
                  <img src={restaurant.logo_url} alt="Logo" className="mt-2 w-20 h-20 object-cover rounded-full border" />
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account Deletion */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 md:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6" /> Danger Zone
            </h2>
            <div className="space-y-4">
              <p className="text-indigo-100/80">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-200 shadow-lg"
              >
                <TrashIcon className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-400">Delete Account</h3>
            <p className="text-indigo-100/80 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingAccount ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-5 h-5" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 