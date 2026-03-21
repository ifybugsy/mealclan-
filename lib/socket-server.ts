import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Main namespace also handles admin room joins
  const adminRoom = 'admin-room';

  // Main namespace for real-time updates (customers and general events)
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected to main namespace: ${socket.id}`);

    // Admin room join/leave
    socket.on('joinAdminRoom', () => {
      socket.join(adminRoom);
      console.log(`[Socket] Admin ${socket.id} joined admin-room`);
    });

    socket.on('leaveAdminRoom', () => {
      socket.leave(adminRoom);
      console.log(`[Socket] Admin ${socket.id} left admin-room`);
    });

    // Listen for cart updates from customers during checkout
    socket.on('cartUpdate', (data: any) => {
      console.log(`[v0] Socket Server - Cart update received from client ${socket.id}:`, JSON.stringify(data, null, 2));
      
      const broadcastData = {
        ...data,
        timestamp: new Date().toISOString(),
        clientId: socket.id,
      };
      
      console.log(`[v0] Socket Server - Broadcasting to admin-room:`, JSON.stringify(broadcastData, null, 2));
      
      // Broadcast to admin room so they see real-time checkout updates
      io.to(adminRoom).emit('cartUpdate', broadcastData);
      
      console.log(`[v0] Socket Server - Cart update SENT to admin-room`);
    });

    // Listen for menu updates
    socket.on('menuUpdate', (data: any) => {
      console.log(`[Socket] Menu update received:`, data);
      io!.emit('menuUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected from main namespace: ${socket.id}`);
    });
  });

  // Customer namespace for order tracking
  const customerNamespace = io.of('/customer');

  customerNamespace.on('connection', (socket) => {
    console.log(`[Socket] Customer connected: ${socket.id}`);

    socket.on('joinCustomerRoom', (data: { orderId: string }) => {
      socket.join(`order-${data.orderId}`);
      console.log(`[Socket] Customer ${socket.id} joined order-${data.orderId}`);
    });

    socket.on('leaveCustomerRoom', (data: { orderId: string }) => {
      socket.leave(`order-${data.orderId}`);
      console.log(`[Socket] Customer ${socket.id} left order-${data.orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Customer disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

// Helper functions to broadcast events
export function broadcastNewOrder(
  io: SocketIOServer,
  orderId: string,
  customerName: string,
  itemCount: number,
  totalPrice: number
) {
  io.to('admin-room').emit('newOrder', {
    orderId,
    customerName,
    itemCount,
    totalPrice,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastDashboardStatsUpdate(
  io: SocketIOServer,
  stats: { total: number; pending: number; completed: number; revenue: number }
) {
  io.to('admin-room').emit('dashboardStatsUpdate', stats);
}

export function broadcastOrderStatusUpdate(
  io: SocketIOServer,
  orderId: string,
  status: string
) {
  io.to('admin-room').emit('orderStatusUpdate', {
    orderId,
    status,
    updatedAt: new Date().toISOString(),
  });

  io.to(`order-${orderId}`).emit('orderStatusUpdate', {
    orderId,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function broadcastMenuUpdate(
  io: SocketIOServer,
  itemId: string,
  changes: Record<string, any>
) {
  io.emit('menuUpdate', {
    itemId,
    changes,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastMenuItemAdded(
  io: SocketIOServer,
  item: Record<string, any>
) {
  // Broadcast to all clients
  io.emit('menuItemAdded', {
    item,
    timestamp: new Date().toISOString(),
  });
  console.log('[Socket] Menu item added broadcast:', item._id);
}

export function broadcastMenuItemUpdated(
  io: SocketIOServer,
  itemId: string,
  item: Record<string, any>
) {
  // Broadcast to all clients
  io.emit('menuItemUpdated', {
    itemId,
    item,
    timestamp: new Date().toISOString(),
  });
  console.log('[Socket] Menu item updated broadcast:', itemId);
}

export function broadcastMenuItemDeleted(
  io: SocketIOServer,
  itemId: string
) {
  // Broadcast to all clients
  io.emit('menuItemDeleted', {
    itemId,
    timestamp: new Date().toISOString(),
  });
  console.log('[Socket] Menu item deleted broadcast:', itemId);
}

export function broadcastCartUpdate(
  io: SocketIOServer,
  data: Record<string, any>
) {
  // Broadcast to admin room for real-time checkout preview
  io.of('/admin').to('admin-room').emit('cartUpdate', {
    ...data,
    timestamp: new Date().toISOString(),
  });
  console.log('[Socket] Cart update broadcast:', data);
}
