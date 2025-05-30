'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { SparklesIcon, DevicePhoneMobileIcon, CreditCardIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [headline, setHeadline] = useState('')
  const fullHeadline = 'QuickDine: The Future of Dining'

  // Typewriter effect for headline
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (headline.length < fullHeadline.length) {
      timeout = setTimeout(() => {
        setHeadline(fullHeadline.slice(0, headline.length + 1))
      }, 60)
    }
    return () => clearTimeout(timeout)
  }, [headline, fullHeadline])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] to-[#232526] relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center min-h-[80vh] text-center px-4 animate-fade-in-up">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
          <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-2xl" />
        </div>
        <div className="w-full flex justify-center mb-2">
          <Lottie 
            animationData={require('../../public/animations/hero-lottie.json')}
            loop
            style={{ width: 260, height: 260 }}
            className="mx-auto drop-shadow-xl"
            aria-label="Animated hero graphic"
          />
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight flex flex-wrap items-center justify-center gap-3">
          <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">QuickDine:</span>
          <span className="text-indigo-100">The Future of <span className="text-indigo-400">Dining</span></span>
        </h1>
        <p className="text-2xl text-indigo-100/90 mb-8 max-w-2xl mx-auto font-medium drop-shadow">
          Transform your restaurant with <span className="text-indigo-300 font-semibold">QR-based ordering</span>, instant payments, and a seamless guest experience. No app required—just scan, order, and enjoy!
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Link
            href="/menu"
            className="rounded-lg border border-indigo-400 px-8 py-4 text-lg font-semibold text-indigo-100 bg-indigo-600 hover:bg-indigo-700 hover:text-white hover:scale-105 focus:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 animate-bounce-once flex items-center gap-2 shadow-lg"
          >
            Try the Menu <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-indigo-400 px-8 py-4 text-lg font-semibold text-indigo-100 bg-white/10 hover:bg-indigo-600 hover:text-white hover:scale-105 focus:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 flex items-center gap-2 shadow"
          >
            Admin Login
          </Link>
        </div>
      </section>
      {/* Info Sections (How it Works, Features, About, Contact) */}
      <section className="max-w-5xl mx-auto mt-20 px-4 grid gap-16">
        {/* How it Works */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How it Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
              <DevicePhoneMobileIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Scan QR</h3>
              <p className="text-gray-200">Customers scan the QR code at their table to access the menu instantly.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
              <CreditCardIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Order & Pay</h3>
              <p className="text-gray-200">Place orders and pay securely from your phone—no waiting for staff.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transition-transform">
              <ChartBarIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Enjoy</h3>
              <p className="text-gray-200">Sit back and relax while your food is prepared and delivered to your table.</p>
            </div>
          </div>
        </div>
        {/* Features */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Features</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:bg-indigo-500/20 hover:scale-105 transition-all">
              <SparklesIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Fast & Contactless</h3>
              <p className="text-gray-200">No app download needed. Everything works in the browser.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:bg-indigo-500/20 hover:scale-105 transition-all">
              <CreditCardIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Secure Payments</h3>
              <p className="text-gray-200">Integrated with Stripe for safe, fast transactions.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg hover:bg-indigo-500/20 hover:scale-105 transition-all">
              <ChartBarIcon className="w-10 h-10 text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-indigo-200 mb-2">Analytics</h3>
              <p className="text-gray-200">Track orders, revenue, and customer trends in real time.</p>
            </div>
          </div>
        </div>
        {/* About */}
        <div id="about" className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-4">About QuickDine</h2>
          <div className="bg-white/10 rounded-xl p-6 max-w-2xl text-gray-200 shadow-lg text-center">
            QuickDine is a modern solution for restaurants looking to streamline operations and delight guests. Our mission is to make dining faster, safer, and more enjoyable for everyone.
          </div>
        </div>
        {/* Contact */}
        <div id="contact" className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-4">Contact</h2>
          <div className="bg-white/10 rounded-xl p-6 max-w-2xl text-gray-200 shadow-lg text-center">
            Have questions or want a demo? <a href="mailto:info@quickdine.com" className="text-indigo-300 underline hover:text-indigo-100 transition">Email us</a> and we'll get back to you soon!
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-5xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">What Our Customers Say</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <div className="text-4xl mb-3">⭐️⭐️⭐️⭐️⭐️</div>
            <p className="text-gray-200 italic mb-4">“QuickDine made our restaurant so much more efficient. Our guests love the QR ordering!”</p>
            <div className="text-indigo-200 font-semibold">Amit S., Restaurant Owner</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <div className="text-4xl mb-3">⭐️⭐️⭐️⭐️⭐️</div>
            <p className="text-gray-200 italic mb-4">“No more waiting for the bill. I just scan, pay, and enjoy my meal!”</p>
            <div className="text-indigo-200 font-semibold">Priya R., Customer</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-lg">
            <div className="text-4xl mb-3">⭐️⭐️⭐️⭐️⭐️</div>
            <p className="text-gray-200 italic mb-4">“Setup was a breeze and support is fantastic. Highly recommend!”</p>
            <div className="text-indigo-200 font-semibold">Rahul M., Cafe Owner</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border border-indigo-100">
            <div className="text-2xl font-bold text-indigo-200 mb-2">Starter</div>
            <div className="text-4xl font-extrabold text-white mb-4">Free</div>
            <ul className="text-gray-200 mb-6 space-y-2 text-center">
              <li>Up to 50 orders/month</li>
              <li>Basic analytics</li>
              <li>Email support</li>
            </ul>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Get Started</button>
          </div>
          <div className="bg-white/20 rounded-xl p-8 flex flex-col items-center shadow-xl border-2 border-indigo-400 scale-105">
            <div className="text-2xl font-bold text-indigo-300 mb-2">Pro</div>
            <div className="text-4xl font-extrabold text-white mb-4">₹999<span className="text-lg font-medium text-indigo-200">/mo</span></div>
            <ul className="text-gray-200 mb-6 space-y-2 text-center">
              <li>Unlimited orders</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Custom branding</li>
            </ul>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Start Pro</button>
          </div>
          <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border border-indigo-100">
            <div className="text-2xl font-bold text-indigo-200 mb-2">Enterprise</div>
            <div className="text-4xl font-extrabold text-white mb-4">Contact Us</div>
            <ul className="text-gray-200 mb-6 space-y-2 text-center">
              <li>All Pro features</li>
              <li>Dedicated account manager</li>
              <li>Custom integrations</li>
            </ul>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-5xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">Is QuickDine easy to set up?</h3>
            <p className="text-gray-200">Absolutely! You can get started in minutes. Just sign up, add your menu, and print your QR codes.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">Can I use my own branding?</h3>
            <p className="text-gray-200">Yes, Pro and Enterprise plans support custom branding for your restaurant.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">Is payment secure?</h3>
            <p className="text-gray-200">All payments are processed securely with industry-leading providers.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">Do you offer support?</h3>
            <p className="text-gray-200">Of course! Our team is here to help via email and chat, with priority support for Pro and Enterprise users.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto mt-20 mb-16 px-4">
        <div className="bg-indigo-700 rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to modernize your restaurant?</h2>
          <p className="text-indigo-100 mb-8 text-lg">Join hundreds of restaurants using QuickDine to delight their guests and streamline operations.</p>
          <Link href="/menu" className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-lg text-lg shadow hover:bg-indigo-100 transition">Try QuickDine Now</Link>
        </div>
      </section>

      {/* Custom Animations for blinking cursor and bounce */}
      <style>{`
        .blinking-cursor {
          display: inline-block;
          width: 1ch;
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to { visibility: hidden; }
        }
        .animate-bounce-once {
          animation: bounce-once 0.8s 1;
        }
        @keyframes bounce-once {
          0% { transform: scale(1); }
          30% { transform: scale(1.12); }
          60% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div className="w-full text-center py-6 text-gray-400 text-sm select-none">
        © {new Date().getFullYear()} QuickDine. All rights reserved.
      </div>
    </div>
  );
}
