'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeOrders, joinAdminRoom, leaveAdminRoom } from '@/hooks/use-socket';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ 
    name: string; 
    quantity: number; 
    price: number;
    soupOptions?: string[];
  }>;
  specialInstructions?: string;
  deliveryType?: string;
  deliveryAddress?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const { orders: realTimeOrders, isConnected } = useRealTimeOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForItems, setSelectedOrderForItems] = useState<Order | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 1 minute
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          setLastRefresh(new Date());
        }
      } catch (error) {
        console.error('[v0] Auto-refresh failed:', error);
      }
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(refreshInterval);
  }, []);

  // Fallback direct API fetch if socket doesn't provide data
  useEffect(() => {
    const fetchOrdersDirectly = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/orders`);
        if (response.ok) {
          const data = await response.json();
          console.log('[v0] Direct fetch orders:', data);
          if (data && data.length > 0 && realTimeOrders.length === 0) {
            setOrders(data);
          }
        }
      } catch (error) {
        console.error('[v0] Direct fetch failed:', error);
      }
    };

    if (!isConnected || realTimeOrders.length === 0) {
      fetchOrdersDirectly();
    }
  }, [isConnected, realTimeOrders]);

  useEffect(() => {
    console.log('[OrdersPage] Socket connected status:', isConnected);
    if (isConnected) {
      console.log('[OrdersPage] Joining admin room');
      joinAdminRoom();
    }

    return () => {
      console.log('[OrdersPage] Leaving admin room');
      leaveAdminRoom();
    };
  }, [isConnected]);

  // Filter orders based on status selection
  useEffect(() => {
    const displayOrders = orders.length > 0 ? orders : realTimeOrders;
    
    if (filterStatus) {
      const filtered = displayOrders.filter((order: Order) => order.status === filterStatus);
      setOrders(filtered);
    } else {
      setOrders(displayOrders);
    }
    setLoading(false);
  }, [realTimeOrders, filterStatus]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and track customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            variant={!filterStatus ? 'default' : 'outline'}
            onClick={() => setFilterStatus('')}
            size="sm"
            className="text-xs sm:text-sm"
          >
            All
          </Button>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
              className="capitalize text-xs sm:text-sm"
              size="sm"
            >
              {status.slice(0, 3)}
            </Button>
          ))}
        </div>
        
        {/* Status and Refresh Info */}
        <div className="flex flex-col gap-1 text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}></div>
            {isConnected ? 'Live' : 'Syncing'}
          </div>
          <div className="text-[10px] text-gray-500">
            Refreshes every 1 min
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No orders found</p>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="bg-white overflow-hidden">
              {/* Order Header - Compact and Clear */}
              <CardHeader className="pb-4 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Order Number and Customer */}
                  <div className="col-span-1">
                    <CardTitle className="text-base sm:text-lg font-bold text-gray-900">{order.orderNumber}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-2 space-y-1">
                      <div><span className="font-medium text-gray-700">{order.customerName}</span></div>
                      <div className="text-gray-600">{order.customerPhone}</div>
                      {order.customerEmail && <div className="text-gray-600 truncate">{order.customerEmail}</div>}
                    </CardDescription>
                  </div>

                  {/* Amount and Badges */}
                  <div className="col-span-1">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">₦{order.totalPrice.toLocaleString()}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={`text-xs ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {order.paymentStatus === 'completed' ? '✓ Paid' : '⏳ Pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Order Date */}
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 font-medium">Order Date</p>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Order Content - Better Organization */}
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center mr-2">👤</span>
                      Customer Info
                    </p>
                    <div className="space-y-2.5 text-xs sm:text-sm">
                      {/* Phone */}
                      <div className="bg-white p-2.5 rounded border border-gray-100">
                        <p className="text-gray-500 text-[10px] font-semibold mb-1 uppercase">Phone</p>
                        <p className="font-bold text-gray-900">{order.customerPhone}</p>
                      </div>
                      
                      {/* Email */}
                      {order.customerEmail && (
                        <div className="bg-white p-2.5 rounded border border-gray-100">
                          <p className="text-gray-500 text-[10px] font-semibold mb-1 uppercase">Email</p>
                          <p className="font-semibold text-gray-900 truncate">{order.customerEmail}</p>
                        </div>
                      )}
                      
                      {/* Delivery Address - Always show real address if provided */}
                      {order.deliveryAddress ? (
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border-2 border-orange-300 shadow-md">
                          <p className="text-orange-900 text-[10px] font-bold mb-2 uppercase tracking-wide flex items-center">
                            <span className="text-lg mr-1.5">📍</span>
                            Delivery Address
                          </p>
                          <p className="font-bold text-gray-900 break-words leading-relaxed bg-white p-2 rounded border-l-4 border-orange-500">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Items Section - Modal Dialog */}
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300 shadow-md">
                    <button
                      onClick={() => setSelectedOrderForItems(order)}
                      className="w-full text-left hover:bg-blue-100 transition-colors rounded p-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full text-xs font-bold flex items-center justify-center mr-2 shadow-md">{order.items.length}</span>
                          Items Ordered
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} TOTAL ITEMS
                          </span>
                          <span className="text-blue-600 font-bold cursor-pointer hover:text-blue-800">
                            View
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Delivery & Instructions Section */}
                  <div className="space-y-3">
                    {order.deliveryType && (
                      <div className={`rounded-lg p-4 border ${order.deliveryType === 'delivery' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${order.deliveryType === 'delivery' ? 'text-orange-900' : 'text-green-900'}`}>Delivery Type</p>
                        <p className={`text-sm font-bold ${order.deliveryType === 'delivery' ? 'text-orange-900' : 'text-green-900'}`}>
                          {order.deliveryType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                        </p>
                        {order.deliveryType === 'delivery' && order.deliveryAddress && (
                          <div className={`text-xs mt-3 p-2 rounded bg-white border-l-2 ${order.deliveryType === 'delivery' ? 'border-orange-500' : 'border-green-500'}`}>
                            <p className="text-gray-600 text-[10px] font-semibold mb-1">📍 Delivery Address</p>
                            <p className="text-gray-900 font-medium break-words">{order.deliveryAddress}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {order.specialInstructions && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">⚠️ Special Instructions</p>
                        <p className="text-sm text-amber-900 break-words">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update - Bottom Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-2">Update Order Status</p>
                      <p className="text-xs text-gray-600">Current: <span className="font-medium capitalize">{order.status}</span></p>
                    </div>
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order._id, value)}>
                      <SelectTrigger className="w-full sm:w-auto text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Items Modal Dialog */}
        <Dialog open={!!selectedOrderForItems} onOpenChange={(open) => !open && setSelectedOrderForItems(null)}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Items - {selectedOrderForItems?.orderNumber}</DialogTitle>
            </DialogHeader>
            
            {selectedOrderForItems && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-700">
                  Total Items: {selectedOrderForItems.items.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                
                <ul className="space-y-4">
                  {selectedOrderForItems.items.map((item, idx) => (
                    <li key={idx} className="bg-white p-4 rounded border border-blue-200">
                      {/* Item Header */}
                      <div className="flex justify-between gap-2 mb-3">
                        <div>
                          <span className="inline-block bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-2 font-bold">{item.quantity}</span>
                          <span className="text-base font-bold text-gray-900">{item.name}</span>
                        </div>
                        <span className="font-bold text-blue-600 text-base">₦{item.price.toLocaleString()}</span>
                      </div>
                      
                      {/* Soup Options */}
                      {(item as any).soupOptions && (item as any).soupOptions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">Served with:</p>
                          <div className="flex flex-wrap gap-2">
                            {(item as any).soupOptions.map((option: string) => (
                              <span key={option} className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 text-sm font-bold px-4 py-2 rounded-full border-2 border-amber-400 shadow-sm">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
