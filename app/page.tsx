'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UtensilsCrossed, Zap } from 'lucide-react';
import { ButtonLoader } from '@/components/button-loader';

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(false);

  const handleOrderClick = () => {
    setShowLoader(true);
    // Loader will hide after timeout, but navigate to store
    setTimeout(() => {
      window.location.href = '/store';
    }, 3000);
  };

  const handleMenuClick = () => {
    setShowLoader(true);
    setTimeout(() => {
      window.location.href = '/store';
    }, 3000);
  };

  return (
    <>
      {showLoader && <ButtonLoader />}
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={150} height={150} className="w-auto h-auto max-w-[50px] sm:max-w-[70px] md:max-w-[100px] lg:max-w-[150px]" priority />
          </Link>
          <div className="flex gap-1 sm:gap-2 md:gap-3 flex-wrap md:flex-nowrap">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs md:text-sm text-slate-100 hover:text-white hover:bg-slate-800 px-2 sm:px-3">Gallery</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs md:text-sm text-slate-100 hover:text-white hover:bg-slate-800 px-2 sm:px-3">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs md:text-sm text-slate-100 hover:text-white hover:bg-slate-800 px-2 sm:px-3">Contact</Button>
            </Link>
            <button onClick={handleMenuClick} className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-white border border-orange-500 border-2 hover:bg-orange-500 hover:text-white transition-colors rounded-md">Menu</button>
            <Link href="/cart">
              <Button size="sm" className="text-[10px] sm:text-xs md:text-sm bg-orange-600 hover:bg-orange-700 px-2 sm:px-3">
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1" />
                <span className="hidden sm:inline">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
            Delicious Meals,
            <span className="text-orange-500"> Fast Delivery</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-2">
            Order your favorite meals from MealClan. Freshly prepared, quickly delivered to your doorstep.
          </p>
          <Button size="lg" onClick={handleOrderClick} className="mt-2 md:mt-4 w-full sm:w-auto text-sm sm:text-base">
            Start Ordering Now
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-8 sm:mt-12 md:mt-20">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3 sm:p-4 md:p-6 text-center">
            <UtensilsCrossed className="w-6 sm:w-8 md:w-10 lg:w-12 h-6 sm:h-8 md:h-10 lg:h-12 text-orange-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1.5 sm:mb-2">Fresh & Tasty</h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">Prepared with the finest ingredients</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3 sm:p-4 md:p-6 text-center">
            <Zap className="w-6 sm:w-8 md:w-10 lg:w-12 h-6 sm:h-8 md:h-10 lg:h-12 text-orange-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1.5 sm:mb-2">Quick Delivery</h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">Get your meals within 30 minutes</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3 sm:p-4 md:p-6 text-center">
            <ShoppingCart className="w-6 sm:w-8 md:w-10 lg:w-12 h-6 sm:h-8 md:h-10 lg:h-12 text-orange-500 mx-auto mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1.5 sm:mb-2">Easy Ordering</h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">Simple, secure, and reliable checkout</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
