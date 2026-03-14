'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function LogoLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader when page is fully loaded
    const handleLoadComplete = () => {
      setIsVisible(false);
    };

    window.addEventListener('load', handleLoadComplete);
    
    // Also hide after a reasonable timeout if page takes too long
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      window.removeEventListener('load', handleLoadComplete);
      clearTimeout(timeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Enlarged Logo - 900x850 */}
        <div className="relative w-[900px] h-[850px] animate-pulse max-w-[90vw] max-h-[90vh]">
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
          <p className="text-slate-300 text-2xl font-bold">Loading MealClan...</p>
          {/* Animated dots */}
          <div className="mt-6 flex justify-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
