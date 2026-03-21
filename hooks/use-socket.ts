import { useEffect, useState } from 'react';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import type { OrderUpdateData } from '@/lib/models';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = initializeSocket();
    setSocket(s);

    const handleConnect = () => {
      console.log('[useSocket] Connected to Socket.IO server');
      setIsConnected(true);
    };

    const handleConnectError = (error: any) => {
      console.error('[useSocket] Connection error:', error);
      setIsConnected(false);
    };

    const handleDisconnect = (reason: string) => {
      console.log('[useSocket] Disconnected. Reason:', reason);
      setIsConnected(false);
    };

    // Add listeners
    s.on('connect', handleConnect);
    s.on('connect_error', handleConnectError);
    s.on('disconnect', handleDisconnect);

    // Set initial state
    if (s.connected) {
      console.log('[useSocket] Socket already connected');
      setIsConnected(true);
    } else {
      console.log('[useSocket] Socket not yet connected, waiting...');
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('connect_error', handleConnectError);
      s.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
}

export function useRealTimeOrders(
  onUpdate?: (orders: any[]) => void,
  onStatusChange?: (orderId: string, status: string) => void
) {
  const { socket, isConnected } = useSocket();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      console.log('[useRealTimeOrders] Socket not initialized yet');
      return;
    }

    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        console.log('[useRealTimeOrders] Fetching orders from:', apiUrl);
        const response = await fetch(`${apiUrl}/orders`);
        const data = await response.json();
        const orderList = Array.isArray(data) ? data : [];
        console.log('[useRealTimeOrders] Fetched orders:', orderList.length);
        setOrders(orderList);
        onUpdate?.(orderList);
      } catch (error) {
        console.error('[useRealTimeOrders] Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if socket is connected
    if (isConnected) {
      console.log('[useRealTimeOrders] Socket connected, fetching orders');
      fetchOrders();
    } else {
      console.log('[useRealTimeOrders] Socket not connected, waiting for connection');
      setLoading(false);
    }

    // Listen for real-time updates
    const handleOrderUpdate = (data: any) => {
      console.log('[useRealTimeOrders] Order status update:', data);
      const orderId = data.orderId || data._id;
      const status = data.status;
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status, updatedAt: data.updatedAt || new Date().toISOString() } : order
        )
      );
      onStatusChange?.(orderId, status);
    };

    const handleNewOrder = (data: any) => {
      console.log('[useRealTimeOrders] New order received:', data);
      setOrders((prev) => [data, ...prev]);
      onUpdate?.([data, ...orders]);
    };

    socket.on('orderStatusUpdate', handleOrderUpdate);
    socket.on('order:status-updated', handleOrderUpdate);
    socket.on('newOrder', handleNewOrder);

    return () => {
      socket.off('orderStatusUpdate', handleOrderUpdate);
      socket.off('order:status-updated', handleOrderUpdate);
      socket.off('newOrder', handleNewOrder);
    };
  }, [socket, isConnected, onUpdate, onStatusChange, orders]);

  return { orders, loading, isConnected };
}

export function useRealTimeDashboardStats(
  onStatsUpdate?: (stats: { total: number; pending: number; completed: number; revenue: number }) => void
) {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !socket) return;

    // Fetch initial stats
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/orders`);
        const data = await response.json();
        const orders = Array.isArray(data) ? data : [];

        const newStats = orders.reduce(
          (acc: any, order: any) => ({
            total: acc.total + 1,
            pending: acc.pending + (order.status === 'pending' ? 1 : 0),
            completed: acc.completed + (order.status === 'completed' ? 1 : 0),
            revenue: acc.revenue + (order.totalPrice || 0),
          }),
          { total: 0, pending: 0, completed: 0, revenue: 0 }
        );

        setStats(newStats);
        onStatsUpdate?.(newStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Listen for real-time updates
    const handleStatsUpdate = (data: { total: number; pending: number; completed: number; revenue: number }) => {
      setStats(data);
      onStatsUpdate?.(data);
    };

    socket.on('dashboardStatsUpdate', handleStatsUpdate);

    return () => {
      socket.off('dashboardStatsUpdate', handleStatsUpdate);
    };
  }, [isConnected, socket, onStatsUpdate]);

  return { stats, loading, isConnected };
}

export function usePendingOrdersCount() {
  const { orders } = useRealTimeOrders();
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Count only active orders: pending and confirmed status
    const pendingCount = orders.filter(
      (order) => order.status === 'pending' || order.status === 'confirmed'
    ).length;
    setCount(pendingCount);
  }, [orders]);

  return count;
}

export function useRealTimeCartUpdates(
  onCartUpdate?: (data: any) => void
) {
  const { socket, isConnected } = useSocket();
  const [cartUpdates, setCartUpdates] = useState<any>(null);

  useEffect(() => {
    if (!socket) {
      console.log('[v0] useRealTimeCartUpdates - Socket not initialized yet');
      return;
    }

    const handleCartUpdate = (data: any) => {
      console.log('[v0] useRealTimeCartUpdates - RECEIVED cartUpdate event:', JSON.stringify(data, null, 2));
      console.log('[v0] useRealTimeCartUpdates - Setting cartUpdates state');
      setCartUpdates(data);
      onCartUpdate?.(data);
    };

    // Listen for cart updates from admin room
    socket.on('cartUpdate', handleCartUpdate);
    console.log('[v0] useRealTimeCartUpdates - Registered listener for cartUpdate events on socket:', socket.id);

    return () => {
      console.log('[v0] useRealTimeCartUpdates - Removing cartUpdate listener');
      socket.off('cartUpdate', handleCartUpdate);
    };
  }, [socket, onCartUpdate]);

  return { cartUpdates, isConnected };
}

export const joinAdminRoom = () => {
  // Use the same socket instance from socket.ts (singleton pattern)
  const s = initializeSocket();
  
  if (s.connected) {
    console.log('[v0] joinAdminRoom - Emitting joinAdminRoom on socket:', s.id);
    s.emit('joinAdminRoom');
  } else {
    console.warn('[v0] joinAdminRoom - Socket not connected, waiting for connection...');
    // Retry when socket connects - only once
    s.once('connect', () => {
      console.log('[v0] joinAdminRoom - Socket connected, emitting joinAdminRoom');
      s.emit('joinAdminRoom');
    });
  }
};

export const leaveAdminRoom = () => {
  const s = initializeSocket();
  if (s.connected) {
    console.log('[v0] leaveAdminRoom - Emitting leaveAdminRoom');
    s.emit('leaveAdminRoom');
  }
};
