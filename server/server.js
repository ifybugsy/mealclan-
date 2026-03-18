import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import database and routes
import { connectToDatabase, getDatabase } from './config/database.js';
import { initializeCollections } from './config/schema.js';
import { authenticate } from './middleware/auth.js';

// Import route handlers
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import galleryRoutes from './routes/gallery.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration for both Socket.io and Express
const corsOrigins = [
  // Production domains
  'https://mealclan.online',
  'https://www.mealclan.online',
  // Environment variable
  process.env.FRONTEND_URL || 'http://localhost:3000',
  // Local development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Store io instance for access in routes
app.locals.io = io;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('[v0] Client connected:', socket.id);

  socket.on('joinAdmin', () => {
    socket.join('admin-room');
    console.log('[v0] Admin joined room:', socket.id);
  });

  socket.on('leaveAdmin', () => {
    socket.leave('admin-room');
    console.log('[v0] Admin left room:', socket.id);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin-room');
    console.log('[v0] Admin joined admin-room:', socket.id);
  });

  socket.on('leaveAdminRoom', () => {
    socket.leave('admin-room');
    console.log('[v0] Admin left admin-room:', socket.id);
  });

  socket.on('joinCustomerRoom', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log('[v0] Customer joined order room:', orderId);
  });

  socket.on('leaveCustomerRoom', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log('[v0] Customer left order room:', orderId);
  });

  // Menu update events from admin
  socket.on('menuUpdated', (data) => {
    console.log('[v0] Menu update from admin:', data);
    io.emit('menuUpdate', data);
  });

  socket.on('menuAdded', (item) => {
    console.log('[v0] Menu item added from admin:', item._id);
    io.emit('menuAdd', item);
  });

  socket.on('menuDeleted', (data) => {
    console.log('[v0] Menu item deleted from admin:', data.itemId);
    io.emit('menuDelete', data);
  });

  // NEW: Real-time menu item events
  socket.on('menuItemAdded', (data) => {
    console.log('[v0] Real-time menu item added:', data.item._id);
    io.emit('menuItemAdded', data);
  });

  socket.on('menuItemUpdated', (data) => {
    console.log('[v0] Real-time menu item updated:', data.itemId);
    io.emit('menuItemUpdated', data);
  });

  socket.on('menuItemDeleted', (data) => {
    console.log('[v0] Real-time menu item deleted:', data.itemId);
    io.emit('menuItemDeleted', data);
  });

  socket.on('disconnect', () => {
    console.log('[v0] Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[v0] Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    path: req.path,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize server
async function start() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Initialize collections
    await initializeCollections();

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`[v0] Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[v0] Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[v0] SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('[v0] HTTP server closed');
    process.exit(0);
  });
});

start();
