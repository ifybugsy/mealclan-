'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { LogOut, LayoutDashboard, UtensilsCrossed, ShoppingCart, Settings } from 'lucide-react';
import { usePendingOrdersCount, joinAdminRoom, leaveAdminRoom } from '@/hooks/use-socket';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const pendingOrdersCount = usePendingOrdersCount();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    joinAdminRoom();
    return () => {
      leaveAdminRoom();
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu Items', icon: UtensilsCrossed },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrdersCount },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-700">
      <div className="p-6 border-b border-slate-700 flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="MealClan Logo" width={48} height={48} className="w-auto h-auto max-w-[48px]" />
        <div className="text-center">
          <p className="text-xs text-slate-400">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive(item.href) ? 'default' : 'ghost'}
              className="w-full justify-start relative"
              size="sm"
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          variant="outline"
          className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-50"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
