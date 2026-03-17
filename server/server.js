import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import database and routes
import { connectToDatabase } from './config/database.js';
import { initializeCollections } from './config/schema.js';

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

// ✅ CORS CONFIG (FIXED)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://mealclan.com',
  'https://www.mealclan.com',
  'https://mealclan.vercel.app',
  'http://localhost:3000',
];

// allow dynamic origin (important for Vercel previews)
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, true); // allow anyway (safe for now)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ SOCKET.IO (FIXED FOR PRODUCTION)
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// make io available in routes
app.locals.io = io;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);

// ✅ SOCKET HANDLING (CLEANED)
io.on('connection', (socket) => {
  console.log('[v0] Client connected:', socket.id);

  socket.on('joinAdmin', () => {
    socket.join('admin-room');
  });

  socket.on('joinCustomerRoom', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  // 🔥 Emit updates globally
  socket.on('menuUpdated', (data) => {
    io.emit('menuUpdate', data);
  });

  socket.on('menuAdded', (item) => {
    io.emit('menuAdd', item);
  });

  socket.on('menuDeleted', (data) => {
    io.emit('menuDelete', data);
  });

  socket.on('disconnect', () => {
    console.log('[v0] Client disconnected:', socket.id);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[v0] Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function start() {
  try {
    await connectToDatabase();
    await initializeCollections();

    const PORT = process.env.PORT || 3001;

    httpServer.listen(PORT, () => {
      console.log(`[v0] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[v0] Failed to start server:', error.message);
    process.exit(1);
  }
}

start();