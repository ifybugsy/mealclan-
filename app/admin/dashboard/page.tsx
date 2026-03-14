'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Clock, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useRealTimeDashboardStats, useSocket, joinAdminRoom, leaveAdminRoom } from '@/hooks/use-socket';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { isConnected } = useSocket();
  const { stats: realTimeStats, loading } = useRealTimeDashboardStats();
  const [stats, setStats] = useState<OrderStats>(realTimeStats);

  useEffect(() => {
    joinAdminRoom();
    return () => {
      leaveAdminRoom();
    };
  }, []);

  useEffect(() => {
    setStats(realTimeStats);
  }, [realTimeStats]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Completed Orders',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to MealClan admin panel</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Welcome to MealClan! Use the sidebar to manage your menu items, view orders, and update settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
