'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function ButtonLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after 3 seconds
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo - 900x850 */}
        <div className="relative w-[400px] h-[375px] md:w-[500px] md:h-[470px] lg:w-[600px] lg:h-[565px] animate-pulse">
          <Image
            src="/logo.png"
            alt="MealClan Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-slate-100 text-lg md:text-xl font-semibold">Preparing Your Order...</p>
          {/* Animated dots */}
          <div className="mt-4 flex justify-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
