import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001';
  }

  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // Auto-detect from current window location
  const { protocol, hostname, port } = window.location;
  
  // For production (when accessed via HTTPS)
  if (protocol === 'https:') {
    // If on a domain like mealclan.onrender.com, connect to wss on same domain
    if (port) {
      return `wss://${hostname}:${port}`;
    }
    return `wss://${hostname}`;
  }

  // For development (HTTP)
  if (port) {
    return `http://${hostname}:${port}`;
  }
  return `http://${hostname}:3001`;
}

export function initializeSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = getSocketUrl();
  console.log('[Socket] Initializing connection to:', socketUrl);

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
    secure: true,
    rejectUnauthorized: false,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server successfully');
  });

  socket.on('connect_error', (error: any) => {
    console.error('[Socket] Connection error:', error.message || error);
  });

  socket.on('disconnect', (reason: string) => {
    console.log('[Socket] Disconnected from server. Reason:', reason);
  });

  socket.on('error', (error: any) => {
    console.error('[Socket] Socket error:', error);
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
  if (s.connected) {
    s.emit('updateOrderStatus', { orderId, status });
  } else {
    console.warn('[Socket] Cannot emit: socket not connected');
    // Queue the emit to retry when connected
    s.once('connect', () => {
      s.emit('updateOrderStatus', { orderId, status });
    });
  }
}

export function joinAdminRoom(): void {
  const s = socket || initializeSocket();
  
  const join = () => {
    if (s.connected) {
      console.log('[Socket] Joining admin room');
      s.emit('joinAdmin');
    } else {
      console.warn('[Socket] Cannot join room: socket not connected, retrying...');
      // Retry after a short delay
      setTimeout(join, 1000);
    }
  };

  join();
}

export function leaveAdminRoom(): void {
  const s = socket || initializeSocket();
  if (s.connected) {
    console.log('[Socket] Leaving admin room');
    s.emit('leaveAdmin');
  }
}

export function joinCustomerRoom(orderId: string): void {
  const s = socket || initializeSocket();
  
  const join = () => {
    if (s.connected) {
      console.log('[Socket] Joining customer room for order:', orderId);
      s.emit('joinCustomerRoom', { orderId });
    } else {
      console.warn('[Socket] Cannot join customer room: socket not connected, retrying...');
      setTimeout(() => join(), 1000);
    }
  };

  join();
}

export function leaveCustomerRoom(orderId: string): void {
  const s = socket || initializeSocket();
  if (s.connected) {
    console.log('[Socket] Leaving customer room for order:', orderId);
    s.emit('leaveCustomerRoom', { orderId });
  }
}
