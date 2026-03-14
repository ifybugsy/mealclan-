'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeOrders, joinAdminRoom, leaveAdminRoom } from '@/hooks/use-socket';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
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

  useEffect(() => {
    joinAdminRoom();
    return () => {
      leaveAdminRoom();
    };
  }, []);

  useEffect(() => {
    // Filter orders based on selected status
    if (filterStatus) {
      const filtered = realTimeOrders.filter((order: Order) => order.status === filterStatus);
      setOrders(filtered);
    } else {
      setOrders(realTimeOrders);
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
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!filterStatus ? 'default' : 'outline'}
          onClick={() => setFilterStatus('')}
        >
          All Orders
        </Button>
        {statuses.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found</p>
        ) : (
          orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription>
                      {order.customerName} • {order.customerPhone}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₦{order.totalPrice}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge className={statusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} - ₦{item.price}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="max-w-xs">
                  <p className="text-sm font-medium mb-2">Update Status:</p>
                  <Select value={order.status} onValueChange={(value) => updateOrderStatus(order._id, value)}>
                    <SelectTrigger>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
