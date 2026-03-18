'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Clock, CheckCircle, Wifi, WifiOff, Calendar } from 'lucide-react';
import { useRealTimeDashboardStats, useSocket, joinAdminRoom, leaveAdminRoom } from '@/hooks/use-socket';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  revenue: number;
}

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

interface WeeklySalesData {
  week: string;
  revenue: number;
  orders: number;
  days: DailySales[];
}

export default function AdminDashboard() {
  const { isConnected } = useSocket();
  const { stats: realTimeStats, loading } = useRealTimeDashboardStats();
  const [stats, setStats] = useState<OrderStats>(realTimeStats);
  const [weeklySales, setWeeklySales] = useState<WeeklySalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<{ revenue: number; orders: number }>({ revenue: 0, orders: 0 });
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    console.log('[AdminDashboard] Socket connected status:', isConnected);
    if (isConnected) {
      console.log('[AdminDashboard] Joining admin room');
      joinAdminRoom();
    }

    return () => {
      console.log('[AdminDashboard] Leaving admin room');
      leaveAdminRoom();
    };
  }, [isConnected]);

  useEffect(() => {
    setStats(realTimeStats);
  }, [realTimeStats]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();

      // Process orders to calculate weekly and monthly sales
      const now = new Date();
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let monthlyRevenue = 0;
      let monthlyOrders = 0;
      const dailyMap: Record<string, DailySales> = {};

      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

        // Only count completed orders
        if (order.status === 'completed' && orderDateOnly >= thirtyDaysAgo) {
          const dateStr = orderDateOnly.toISOString().split('T')[0];
          
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
          }
          
          dailyMap[dateStr].revenue += order.totalPrice;
          dailyMap[dateStr].orders += 1;
          
          monthlyRevenue += order.totalPrice;
          monthlyOrders += 1;
        }
      });

      // Group days by week
      const weeklyMap: Record<string, WeeklySalesData> = {};
      Object.values(dailyMap).forEach((day) => {
        const date = new Date(day.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyMap[weekKey]) {
          weeklyMap[weekKey] = {
            week: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            revenue: 0,
            orders: 0,
            days: [],
          };
        }

        weeklyMap[weekKey].revenue += day.revenue;
        weeklyMap[weekKey].orders += day.orders;
        weeklyMap[weekKey].days.push(day);
      });

      const sortedWeeks = Object.values(weeklyMap).sort(
        (a, b) => new Date(b.days[0]?.date || 0).getTime() - new Date(a.days[0]?.date || 0).getTime()
      );

      setWeeklySales(sortedWeeks);
      setMonthlySales({ revenue: monthlyRevenue, orders: monthlyOrders });
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoadingSales(false);
    }
  };

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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome to MealClan admin panel</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color.split('-')[1] }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Sales Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Monthly Revenue</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              ₦{monthlySales.revenue.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-blue-700 mt-2">{monthlySales.orders} completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Monthly Orders</CardTitle>
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900">
              {monthlySales.orders}
            </div>
            <p className="text-xs sm:text-sm text-purple-700 mt-2">Avg: ₦{monthlySales.orders > 0 ? Math.round(monthlySales.revenue / monthlySales.orders).toLocaleString() : 0}/order</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sales Breakdown */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <CardTitle className="text-sm sm:text-base">Weekly Sales Breakdown</CardTitle>
              <CardDescription className="text-xs">Last 30 days of completed orders</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <p className="text-sm text-gray-500">Loading sales data...</p>
          ) : weeklySales.length === 0 ? (
            <p className="text-sm text-gray-500">No completed orders in the last 30 days</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {weeklySales.map((week, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm text-gray-900">{week.week}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        ₦{week.revenue.toLocaleString()}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        {week.orders} orders
                      </span>
                    </div>
                  </div>
                  
                  {/* Daily breakdown */}
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {week.days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((day, dayIdx) => (
                      <div key={dayIdx} className="flex items-center justify-between bg-white p-2 rounded text-xs border border-gray-100">
                        <span className="text-gray-600">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-900">₦{day.revenue.toLocaleString()}</span>
                          <span className="text-gray-500">({day.orders})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-gray-600">
            Welcome to MealClan! Use the sidebar to manage your menu items, view orders, and update settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
