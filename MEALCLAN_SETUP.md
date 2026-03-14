# MealClan Restaurant Ordering System - Setup Guide

## Project Overview

MealClan is a complete restaurant ordering system with:
- **Public Menu Store**: Customers browse and order meals
- **Admin Dashboard**: Restaurant staff manage menu, orders, and settings
- **Order Management**: Track orders from placement to completion
- **Payment Integration**: Support for cash and bank transfer payments
- **WhatsApp Integration**: Direct customer communication

## Environment Variables

Add these to your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://MealClan:iis4you123@@mealclan.tg8wzhl.mongodb.net/?appName=MealClan
VERCEL_BLOB_TOKEN=your_vercel_blob_token_here
JWT_SECRET=your-super-secret-key-change-in-production
```

## Database Setup

The application automatically creates MongoDB collections on first use:
- `menu_items` - Restaurant menu items
- `orders` - Customer orders
- `settings` - Restaurant configuration
- `users` - User accounts (future use)

## Features

### Customer Features
- Browse restaurant menu by category
- Add items to cart and adjust quantities
- Checkout with customer details
- Choose delivery type (pickup/delivery)
- Select payment method (cash/bank transfer)
- Receive order confirmation and WhatsApp contact

### Admin Features
- Login with credentials (demo: admin@mealclan.com / mealclan2024)
- Dashboard with order statistics and analytics
- Menu management (add/edit/delete items with images)
- Order tracking and status updates
- Settings management (restaurant info, WhatsApp, bank details)

## Routes

### Public Routes
- `/` - Home page
- `/store` - Menu store for browsing items
- `/cart` - Shopping cart and checkout
- `/order-confirmation/[id]` - Order confirmation page

### Admin Routes
- `/admin/login` - Admin login page
- `/admin/dashboard` - Dashboard with stats
- `/admin/menu` - Menu management
- `/admin/orders` - Order tracking
- `/admin/settings` - Restaurant settings

## API Endpoints

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create new menu item
- `PATCH /api/menu/[id]` - Update menu item
- `DELETE /api/menu/[id]` - Delete menu item
- `GET /api/menu/[id]` - Get specific menu item

### Orders
- `GET /api/orders` - Get all orders (filter by status)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status
- `GET /api/orders/[id]` - Get specific order

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Settings
- `GET /api/settings` - Get restaurant settings
- `PATCH /api/settings` - Update restaurant settings

### File Upload
- `POST /api/upload` - Upload image to Vercel Blob

## Admin Login Details

**Demo Credentials:**
- Email: `admin@mealclan.com`
- Password: `mealclan2024`

Change these in `/app/api/auth/login/route.ts` before production!

## WhatsApp Integration

The system uses your WhatsApp number for customer communication. Customers can:
1. View the WhatsApp number in order confirmation
2. Send payment receipts for bank transfer orders
3. Get order confirmation and updates

Update the WhatsApp number in Admin > Settings

## Vercel Blob Storage

Images are stored in Vercel Blob. To set up:
1. Connect your Vercel project
2. Create a Blob storage token
3. Add `VERCEL_BLOB_TOKEN` to environment variables

## Database Models

### MenuItem
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  category: string,
  image: string,
  available: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```typescript
{
  _id: ObjectId,
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  items: OrderItem[],
  totalPrice: number,
  status: string,
  deliveryType: 'pickup' | 'delivery',
  deliveryAddress: string,
  specialInstructions: string,
  paymentMethod: 'cash' | 'transfer',
  paymentStatus: 'pending' | 'completed',
  createdAt: Date,
  updatedAt: Date
}
```

## Order Status Workflow

1. **pending** - Order received, awaiting confirmation
2. **confirmed** - Restaurant confirmed the order
3. **preparing** - Kitchen is preparing the food
4. **ready** - Order is ready for pickup/delivery
5. **completed** - Order delivered/picked up
6. **cancelled** - Order was cancelled

## Customization

### Change Admin Credentials
Edit `/app/api/auth/login/route.ts`:
```typescript
const ADMIN_EMAIL = 'your-email@example.com';
const ADMIN_PASSWORD = 'your-secure-password';
```

### Update Restaurant Name
Edit `/app/api/settings/route.ts` default settings or use Admin > Settings

### Modify Categories
Edit the category dropdown in `/app/admin/menu/page.tsx`

### Change Colors/Theme
Edit `/app/globals.css` for color tokens

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel settings
4. Deploy

The app is ready for production deployment!

## Support

For issues or questions:
1. Check database connection in MongoDB Atlas
2. Verify all environment variables are set
3. Ensure Vercel Blob token is valid
4. Check browser console for error messages

## Future Enhancements

- Email notifications for orders
- Real-time order status updates with WebSockets
- Payment gateway integration (Paystack, Stripe)
- Customer reviews and ratings
- Loyalty program
- Multi-language support
- Advanced analytics and reports
