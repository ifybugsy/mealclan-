import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (socket) {
    return socket;
  }

  const socketUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://mealclan.online')
    : 'https://www.mealclan.online';
  
  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Real-time event listeners
export function onOrderStatusUpdate(
  callback: (data: { orderId: string; status: string; updatedAt: string }) => void
) {
  const s = socket || initializeSocket();
  s.on('orderStatusUpdate', callback);
  return () => s.off('orderStatusUpdate', callback);
}

export function onNewOrder(
  callback: (data: { orderId: string; customerName: string; itemCount: number; totalPrice: number }) => void
) {
  const s = socket || initializeSocket();
  s.on('newOrder', callback);
  return () => s.off('newOrder', callback);
}

export function onDashboardStatsUpdate(
  callback: (data: { total: number; pending: number; completed: number; revenue: number }) => void
) {
  const s = socket || initializeSocket();
  s.on('dashboardStatsUpdate', callback);
  return () => s.off('dashboardStatsUpdate', callback);
}

export function onMenuUpdate(
  callback: (data: { itemId: string; changes: Record<string, any> }) => void
) {
  const s = socket || initializeSocket();
  s.on('menuUpdate', callback);
  return () => s.off('menuUpdate', callback);
}

// Emit events
export function emitOrderStatusChange(orderId: string, status: string): void {
  const s = socket || initializeSocket();
  s.emit('updateOrderStatus', { orderId, status });
}

export function joinAdminRoom(): void {
  const s = socket || initializeSocket();
  s.emit('joinAdminRoom');
}

export function leaveAdminRoom(): void {
  const s = socket || initializeSocket();
  s.emit('leaveAdminRoom');
}

export function joinCustomerRoom(orderId: string): void {
  const s = socket || initializeSocket();
  s.emit('joinCustomerRoom', { orderId });
}

export function leaveCustomerRoom(orderId: string): void {
  const s = socket || initializeSocket();
  s.emit('leaveCustomerRoom', { orderId });
}
