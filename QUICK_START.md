# MealClan - Quick Start Guide

## 1. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://MealClan:iis4you123@@mealclan.tg8wzhl.mongodb.net/?appName=MealClan
VERCEL_BLOB_TOKEN=your_blob_token_here
JWT_SECRET=change-this-to-random-string
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 4. Access the Application

### For Customers:
- Visit `http://localhost:3000`
- Browse menu at `/store`
- Add items to cart and checkout

### For Admin:
- Go to `http://localhost:3000/admin/login`
- Login with:
  - Email: `admin@mealclan.com`
  - Password: `mealclan2024`
- Manage menu, orders, and settings

## 5. Quick Actions

### Add a Menu Item
1. Login to admin
2. Click "Menu Items"
3. Click "Add Item"
4. Fill in details and upload image
5. Click "Create Item"

### Update Order Status
1. Go to "Orders" in admin
2. Click on an order
3. Select new status
4. Status updates in real-time

### Configure Settings
1. Go to "Settings" in admin
2. Update restaurant name, WhatsApp, bank details
3. Click "Save Settings"

## 6. MongoDB Connection Test

The app automatically tests the connection when you first load it. If you see database errors:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access allows your IP
- Ensure the database user has correct permissions

## 7. Image Upload Setup

Images are stored in Vercel Blob. To enable:
1. Have a Vercel project connected
2. Create a Blob token in Vercel dashboard
3. Set `VERCEL_BLOB_TOKEN` environment variable

Without it, menu items can be created but images won't upload.

## File Structure

```
app/
├── page.tsx                 # Home page
├── store/                   # Public store pages
├── cart/                    # Cart and checkout
├── order-confirmation/      # Order success page
├── admin/                   # Admin section
│   ├── login/              # Admin login
│   ├── dashboard/          # Dashboard
│   ├── menu/               # Menu management
│   ├── orders/             # Order tracking
│   └── settings/           # Settings
└── api/                    # API routes
    ├── menu/               # Menu endpoints
    ├── orders/             # Orders endpoints
    ├── auth/               # Authentication
    ├── settings/           # Settings endpoint
    └── upload/             # File upload

lib/
├── mongodb.ts              # Database connection
├── models.ts               # TypeScript interfaces
├── auth.ts                 # Authentication utilities
└── cart-context.tsx        # Cart state management

components/
├── admin-sidebar.tsx       # Admin navigation
├── menu-store.tsx          # Menu display component
└── ui/                     # shadcn/ui components
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

### "Image upload fails"
- Check `VERCEL_BLOB_TOKEN` is set
- Verify Vercel Blob is enabled
- Check file size (max 50MB)

### "Admin login not working"
- Clear browser cookies
- Check credentials are correct
- Verify JWT_SECRET is set

### "Cart items disappear"
- Cart uses localStorage
- Clear browser cache if experiencing issues
- LocalStorage is reset on browser data clear

## Next Steps

1. Update admin credentials in production
2. Add your menu items
3. Configure payment settings
4. Test the complete order flow
5. Deploy to Vercel
6. Share with customers!

## Support

Refer to `MEALCLAN_SETUP.md` for detailed documentation and advanced setup.
