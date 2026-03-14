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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-20 md:h-28 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="MealClan Logo" width={100} height={100} className="w-auto h-auto max-w-[45px] sm:max-w-[60px] md:max-w-[80px] lg:max-w-[100px]" />
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs md:text-sm px-2 sm:px-3">
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Cart</span> ({cartItemsCount})
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Our Menu</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Browse our delicious selection</p>
          </div>
          {cartItemsCount > 0 && (
            <div className="text-right bg-orange-50 p-2 sm:p-3 rounded-lg w-full sm:w-auto">
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Cart Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">₦{total.toLocaleString()}</p>
            </div>
          )}
        </div>

        <MenuStore onAddToCart={handleAddToCart} />
      </main>
    </div>
  );
}
