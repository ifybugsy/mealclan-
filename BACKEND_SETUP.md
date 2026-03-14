# MealClan Express Backend Setup & Integration Guide

## Overview

This guide covers the complete setup of the Express backend server that works alongside the Next.js frontend for the MealClan restaurant ordering system.

## Architecture

```
┌─────────────────────────────────────┐
│      Next.js Frontend                │
│    (http://localhost:3000)           │
└─────────────────────────────────────┘
             ↓ (HTTP & WebSocket)
┌─────────────────────────────────────┐
│    Express Backend Server            │
│    (http://localhost:3001)           │
└─────────────────────────────────────┘
             ↓ (Database Driver)
┌─────────────────────────────────────┐
│      MongoDB Atlas / Local           │
│     (Cloud or Self-Hosted)           │
└─────────────────────────────────────┘
```

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster
4. Create a database user and get connection string
5. Copy the connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/mealclan?retryWrites=true&w=majority`)

### Option B: Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/mealclan`

## Step 2: Configure Backend Server

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Create `.env` File

```bash
cp .env.example .env
```

### 3. Edit `.env` with Your Settings

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mealclan?retryWrites=true&w=majority

# Server Port
PORT=3001

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-123456789

# Default Admin Credentials (CHANGE THESE IMMEDIATELY IN PRODUCTION)
ADMIN_EMAIL=admin@mealclan.com
ADMIN_PASSWORD=admin123456

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start the Backend Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

You'll see:
```
[v0] MongoDB connected successfully
[v0] Created menu_items collection
[v0] Created orders collection
[v0] Created settings collection
[v0] Created users collection
[v0] Database schema initialization completed
[v0] Server running on http://localhost:3001
```

### Production Mode

```bash
npm start
```

## Step 4: Verify Backend is Running

### Test API Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

### Test Authentication

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mealclan.com","password":"admin123456"}'
```

Expected response:
```json
{
  "success":true,
  "token":"eyJhbGciOiJIUzI1NiIs...",
  "user":{"id":"...","email":"admin@mealclan.com","name":"Admin User"}
}
```

## Step 5: Configure Frontend Integration

### 1. Update Frontend Environment

Create or update `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 2. Import API Client

In any Next.js component:

```typescript
import { authAPI, menuAPI, orderAPI, settingsAPI } from '@/lib/api-client';

// Login
const token = await authAPI.login('admin@mealclan.com', 'admin123456');

// Get menu items
const items = await menuAPI.getAll();

// Create order
const order = await orderAPI.create({
  customerName: 'John Doe',
  customerPhone: '1234567890',
  items: [{
    id: '123',
    name: 'Burger',
    price: 5000,
    quantity: 2
  }],
  totalPrice: 10000,
  paymentStatus: 'completed'
});
```

## Step 6: Admin Dashboard Features

The admin dashboard at `/admin/dashboard` includes:

### Features Working with Backend:

1. **Real-Time Dashboard Stats**
   - Total Orders
   - Pending Orders
   - Completed Orders
   - Total Revenue
   - Live connection status indicator

2. **Menu Management** (`/admin/menu`)
   - View all menu items
   - Add new items
   - Edit existing items
   - Delete items
   - Toggle availability

3. **Order Management** (`/admin/orders`)
   - View all orders
   - Filter by status
   - Update order status (pending → confirmed → preparing → ready → completed)
   - Update payment status
   - View order details

4. **Settings** (`/admin/settings`)
   - Configure restaurant info
   - Update business settings
   - Real-time synchronization

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password

### Menu Management
- `GET /api/menu` - Get all items
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Create item (admin)
- `PUT /api/menu/:id` - Update item (admin)
- `DELETE /api/menu/:id` - Delete item (admin)
- `GET /api/menu/stats/summary` - Menu statistics (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update status (admin)
- `PATCH /api/orders/:id/payment` - Update payment (admin)
- `DELETE /api/orders/:id` - Delete order (admin)
- `GET /api/orders/stats/dashboard` - Order statistics (admin)

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings/:key` - Set setting (admin)
- `PUT /api/settings` - Bulk update (admin)
- `GET /api/settings/restaurant/info` - Restaurant info
- `PUT /api/settings/restaurant/info` - Update restaurant info (admin)

## Real-Time Features (Socket.io)

The backend broadcasts real-time updates:

### Admin Room Events
```javascript
// Emitted when order status changes
socket.on('order:status-updated', (order) => {
  console.log('Order status changed:', order);
});

// Emitted when payment status changes
socket.on('order:payment-updated', (order) => {
  console.log('Payment status changed:', order);
});

// Emitted when settings change
socket.on('settings:updated', (setting) => {
  console.log('Setting changed:', setting);
});
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MONGODB_URI environment variable is not set`

**Solution:** 
1. Check `.env` file exists and has `MONGODB_URI` set
2. Verify MongoDB credentials are correct
3. Check if MongoDB Atlas IP whitelist includes your IP

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env
PORT=3002
```

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify `FRONTEND_URL` matches your frontend URL in `.env`
2. Check frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Ensure server is running when frontend makes requests

### JWT Token Errors

**Error:** `Invalid or expired token`

**Solution:**
1. Generate a new `JWT_SECRET` in `.env`
2. Re-login to get new token
3. Check token hasn't expired (7 days)

## Production Deployment

### 1. Prepare for Production

```bash
# Set environment
NODE_ENV=production

# Use strong JWT secret
JWT_SECRET=generate-a-strong-random-string-here

# Update MongoDB URI to production instance
MONGODB_URI=your-production-mongodb-uri

# Update FRONTEND_URL to production domain
FRONTEND_URL=https://yourdomain.com
```

### 2. Deploy to Hosting

Options:
- **Railway.app** - `npm install -g railway && railway login`
- **Render** - Connect GitHub repo
- **Heroku** - `heroku create && git push heroku main`
- **AWS** - Use Elastic Beanstalk or EC2

### 3. Database Backups

For MongoDB Atlas:
1. Enable automated backups (default: enabled)
2. Configure backup retention policy
3. Set up monitoring alerts

## Security Checklist

- [ ] Changed default admin password
- [ ] Generated strong JWT_SECRET
- [ ] Enabled HTTPS/TLS in production
- [ ] Set up MongoDB IP whitelist
- [ ] Configured CORS properly
- [ ] Set NODE_ENV=production
- [ ] Enabled database backups
- [ ] Set up monitoring/logging
- [ ] Configured firewall rules
- [ ] Regular security audits

## Performance Optimization

1. **Database Indexing** - Already configured for:
   - menu_items: name, category
   - orders: orderNumber, status, createdAt
   - settings: key
   - users: email

2. **Connection Pooling** - MongoDB pool size 5-10 connections

3. **Caching** - Implement Redis for frequently accessed data

4. **Rate Limiting** - Consider implementing in production

## Support & Monitoring

### Logs

All logs use `[v0]` prefix:
```bash
# Filter logs
grep "\[v0\]" logfile.txt
```

### Metrics

Monitor these metrics:
- API response times
- Database connection count
- Order creation rate
- Real-time user count

## Next Steps

1. Configure production database
2. Set up SSL/TLS certificates
3. Deploy to production server
4. Configure domain name
5. Set up monitoring and alerts
6. Train staff on admin dashboard

For questions or issues, check the server logs first:
```bash
# View logs with timestamps
pm2 logs mealclan-server --lines 100
```
