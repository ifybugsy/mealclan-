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

  // Admin namespace for dashboard and order management
  const adminNamespace = io.of('/admin');

  adminNamespace.on('connection', (socket) => {
    console.log(`[Socket] Admin connected: ${socket.id}`);

    socket.on('joinAdminRoom', () => {
      socket.join('admin-room');
      console.log(`[Socket] Admin ${socket.id} joined admin-room`);
    });

    socket.on('leaveAdminRoom', () => {
      socket.leave('admin-room');
      console.log(`[Socket] Admin ${socket.id} left admin-room`);
    });

    socket.on('updateOrderStatus', async (data: { orderId: string; status: string }) => {
      console.log(`[Socket] Order status update: ${data.orderId} -> ${data.status}`);
      
      // Broadcast to all admins
      adminNamespace.to('admin-room').emit('orderStatusUpdate', {
        orderId: data.orderId,
        status: data.status,
        updatedAt: new Date().toISOString(),
      });

      // Notify customer about their order
      io!.to(`order-${data.orderId}`).emit('orderStatusUpdate', {
        orderId: data.orderId,
        status: data.status,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Admin disconnected: ${socket.id}`);
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
  io.of('/admin').to('admin-room').emit('newOrder', {
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
  io.of('/admin').to('admin-room').emit('dashboardStatsUpdate', stats);
}

export function broadcastOrderStatusUpdate(
  io: SocketIOServer,
  orderId: string,
  status: string
) {
  io.of('/admin').to('admin-room').emit('orderStatusUpdate', {
    orderId,
    status,
    updatedAt: new Date().toISOString(),
  });

  io.of('/customer').to(`order-${orderId}`).emit('orderStatusUpdate', {
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
  io.of('/admin').emit('menuUpdate', {
    itemId,
    changes,
    timestamp: new Date().toISOString(),
  });
}
