'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MenuStore } from '@/components/menu-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function StorePage() {
  const { cart, addToCart, total } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart(item);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-24 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="MealClan Services Logo" width={100} height={100} className="w-auto h-auto max-w-[40px] sm:max-w-[50px] md:max-w-[70px] lg:max-w-[90px]" />
          </Link>
          
          <div className="flex-1 text-center">
            <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">MealClan Services</p>
          </div>

          <Link href="/cart">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cart</span> ({cartItemsCount})
            </Button>
          </Link>
        </div>
      </nav>

      {/* Modern Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400 rounded-full -ml-36 -mb-36 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white tracking-tight">
              Our Menu
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Discover our handcrafted selection of authentic Nigerian dishes, made fresh daily with the finest ingredients. Experience culinary excellence with every bite.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {cartItemsCount > 0 && (
        <div className="sticky top-20 sm:top-24 md:top-28 z-40 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm text-slate-700">Items in cart: <span className="font-bold text-slate-900">{cartItemsCount}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Total: ₦{total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <MenuStore onAddToCart={handleAddToCart} />
      </main>
    </div>
  );
}
