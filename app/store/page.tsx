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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-24 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={100} height={100} className="w-auto h-auto max-w-[40px] sm:max-w-[50px] md:max-w-[70px] lg:max-w-[90px]" />
          </Link>
          
          <div className="flex-1 text-center">
            <p className="text-sm sm:text-base font-bold text-gray-900">MealClan</p>
          </div>

          <Link href="/cart">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-md">
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cart</span> ({cartItemsCount})
            </Button>
          </Link>
        </div>
      </nav>

      {/* Modern Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full -ml-36 -mb-36"></div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white">
              Our Menu
            </h1>
            <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
              Discover our handcrafted selection of authentic Nigerian dishes, made fresh daily with the finest ingredients.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {cartItemsCount > 0 && (
        <div className="sticky top-20 sm:top-24 md:top-28 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Items in cart: <span className="font-bold text-gray-900">{cartItemsCount}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm sm:text-base font-bold text-blue-600">
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
