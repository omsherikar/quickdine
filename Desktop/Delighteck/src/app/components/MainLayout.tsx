"use client";
import Link from 'next/link';
import { useState } from 'react';

// Define navigation links outside the component to ensure consistency
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
] as const;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] to-[#232526] relative overflow-x-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-60px] left-[-60px] w-56 h-56 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-pink-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
      </div>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-indigo-500 tracking-tight drop-shadow flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-xl">🍽️</span>
              <span className="ml-1">QuickDine</span>
            </span>
          </div>
          <div className="flex gap-2 sm:gap-6">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-3 py-1 text-indigo-100 font-medium transition-colors duration-200 hover:text-white focus:text-white group"
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-indigo-400 transition-all duration-300 group-hover:w-full group-focus:w-full" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* Error Alert */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-red-200 transition"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8">
        <div className="bg-white/5 rounded-2xl shadow-xl p-6 sm:p-10 min-h-[70vh]">
          {children}
        </div>
      </main>
      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 