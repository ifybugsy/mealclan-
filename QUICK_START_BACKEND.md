# MealClan Backend - Quick Start Guide

## 1. Get Your MongoDB URI

You need a MongoDB database. Get a connection string from:
- **MongoDB Atlas** (Free): https://www.mongodb.com/cloud/atlas
- **Local MongoDB**: `mongodb://localhost:27017/mealclan`

## 2. Backend Setup (5 minutes)

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Open .env and update these values:
# - MONGODB_URI = your database connection string
# - JWT_SECRET = change to something random
# - ADMIN_EMAIL = your admin email
# - ADMIN_PASSWORD = your admin password

nano .env
```

## 3. Start the Backend

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend will start on: **http://localhost:3001**

## 4. Admin Login

The backend automatically creates an admin user with:
- Email: `admin@mealclan.com` (change in .env)
- Password: `admin123456` (change in .env)

## 5. Test Backend

```bash
# Health check
curl http://localhost:3001/health

# Get menu items
curl http://localhost:3001/api/menu

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mealclan.com","password":"admin123456"}'
```

## 6. Frontend Configuration

The frontend automatically connects to the backend. Make sure:
- Backend is running on `http://localhost:3001`
- Frontend has `.env.local` with: `NEXT_PUBLIC_API_URL=http://localhost:3001`

## 7. Common Issues

**"MONGODB_URI is not set"**
- Edit `server/.env` and add your MongoDB connection string

**"Cannot connect to MongoDB"**
- Check your MongoDB URI is correct
- Ensure MongoDB server is running
- Verify network access in MongoDB Atlas (IP whitelist)

**"Socket.io connection failed"**
- Ensure backend is running on port 3001
- Check FRONTEND_URL in .env matches your frontend URL

**"Admin login fails"**
- Default is email: `admin@mealclan.com`, password: `admin123456`
- Change in `.env` file for different credentials

## 8. File Structure

```
server/
├── server.js           # Main app file
├── package.json        # Dependencies
├── .env               # Configuration (CREATED)
├── config/            # Database & schema setup
├── middleware/        # Authentication & error handling
└── routes/            # API endpoints (auth, menu, orders, settings)
```

## 9. All Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Create menu item (admin) |
| PUT | `/api/menu/:id` | Update menu item (admin) |
| DELETE | `/api/menu/:id` | Delete menu item (admin) |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings (admin) |

## 10. Need Help?

- See `BACKEND_SETUP.md` for detailed setup instructions
- See `BACKEND_VERIFICATION.md` for complete feature list
- Check `server/README.md` for API documentation

---

**Backend Status:** ✅ Ready to use
**Separate Folder:** ✅ Yes (`/server` folder)
**.env File:** ✅ Created (`/server/.env`)
**All Features:** ✅ Fully implemented
