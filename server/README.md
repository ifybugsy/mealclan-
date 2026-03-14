# MealClan Express Backend

A complete Express.js backend server for the MealClan restaurant ordering application with MongoDB, JWT authentication, and real-time Socket.io updates.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealclan?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@mealclan.com
ADMIN_PASSWORD=admin123456
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will be available at `http://localhost:3001`

## API Endpoints

### Authentication Routes (`/api/auth`)

- **POST /api/auth/login** - Admin login
  - Body: `{ email, password }`
  - Returns: JWT token and user info

- **POST /api/auth/logout** - Admin logout
  - Clears authentication cookie

- **GET /api/auth/verify** - Verify authentication token
  - Requires: JWT token
  - Returns: Current user info

- **POST /api/auth/change-password** - Change admin password
  - Requires: JWT token
  - Body: `{ currentPassword, newPassword }`

### Menu Routes (`/api/menu`)

- **GET /api/menu** - Get all menu items
  - Query: `category` (optional)
  - Returns: Array of menu items

- **GET /api/menu/:id** - Get single menu item
  - Returns: Menu item details

- **POST /api/menu** - Create menu item (admin only)
  - Requires: JWT token
  - Body: `{ name, description, price, category, image, available }`

- **PUT /api/menu/:id** - Update menu item (admin only)
  - Requires: JWT token
  - Body: `{ name, description, price, category, image, available }`

- **DELETE /api/menu/:id** - Delete menu item (admin only)
  - Requires: JWT token

- **GET /api/menu/stats/summary** - Get menu statistics (admin only)
  - Returns: Total items, available items, categories

### Order Routes (`/api/orders`)

- **GET /api/orders** - Get all orders (admin only)
  - Query: `status` (optional)
  - Returns: Array of orders

- **GET /api/orders/:id** - Get single order
  - Returns: Order details

- **POST /api/orders** - Create new order
  - Body: `{ customerName, customerPhone, items, totalPrice, paymentStatus, specialInstructions }`

- **PATCH /api/orders/:id/status** - Update order status (admin only)
  - Requires: JWT token
  - Body: `{ status }` - Must be: pending, confirmed, preparing, ready, completed, cancelled

- **PATCH /api/orders/:id/payment** - Update payment status (admin only)
  - Requires: JWT token
  - Body: `{ paymentStatus }` - Must be: pending, completed, failed, cancelled

- **GET /api/orders/stats/dashboard** - Get order statistics (admin only)
  - Returns: Total orders, pending, completed, total revenue

- **DELETE /api/orders/:id** - Delete order (admin only)
  - Requires: JWT token

### Settings Routes (`/api/settings`)

- **GET /api/settings** - Get all settings
  - Returns: Settings object

- **GET /api/settings/:key** - Get specific setting
  - Returns: Single setting value

- **POST /api/settings/:key** - Create/update setting (admin only)
  - Requires: JWT token
  - Body: `{ value }`

- **PUT /api/settings** - Bulk update settings (admin only)
  - Requires: JWT token
  - Body: `{ key1: value1, key2: value2, ... }`

- **GET /api/settings/restaurant/info** - Get restaurant info
  - Returns: Restaurant details

- **PUT /api/settings/restaurant/info** - Update restaurant info (admin only)
  - Requires: JWT token
  - Body: `{ restaurantName, restaurantPhone, restaurantAddress, restaurantEmail }`

## Socket.io Events

### Admin Room Events

- **join_admin** - Admin joins real-time updates room
- **leave_admin** - Admin leaves room
- **order:status-updated** - Emitted when order status changes
- **order:payment-updated** - Emitted when payment status changes
- **order:deleted** - Emitted when order is deleted
- **settings:updated** - Emitted when setting is updated
- **settings:bulk-updated** - Emitted when multiple settings updated
- **settings:restaurant-updated** - Emitted when restaurant info updated

### Customer Room Events

- **join_customer** - Customer joins order tracking room
- **order:status-updated** - Real-time order status updates

## Database Schema

### menu_items Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String (URL),
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String,
  customerName: String,
  customerPhone: String,
  items: Array[{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalPrice: Number,
  status: String,
  paymentStatus: String,
  specialInstructions: String,
  createdAt: Date,
  updatedAt: Date
}
```

### settings Collection
```javascript
{
  _id: ObjectId,
  key: String,
  value: Any,
  updatedAt: Date
}
```

### users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String,
  createdAt: Date
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in:

1. **Cookie** (automatically set after login)
2. **Authorization Header**: `Authorization: Bearer <token>`

Default credentials:
- Email: admin@mealclan.com
- Password: admin123456

Change these in your `.env` file.

## Features

- JWT-based authentication with bcrypt password hashing
- Role-based access control (admin routes protected)
- Real-time updates via Socket.io
- Order tracking and management
- Menu item management
- Restaurant settings management
- Error handling and validation
- CORS support
- MongoDB connection pooling

## Development

### Debug Logging

All debug logs use the `[v0]` prefix for easy filtering:

```javascript
console.log('[v0] Message here');
```

### Error Handling

The server includes comprehensive error handling with proper HTTP status codes and error messages.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mealclan-server"
   ```
3. Set up proper MongoDB Atlas credentials
4. Configure CORS for your frontend domain

## License

MIT
