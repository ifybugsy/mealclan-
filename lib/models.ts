import { ObjectId } from 'mongodb';

export interface MenuItem {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: ObjectId;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  paymentMethod: 'cash' | 'transfer';
  paymentStatus: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt: Date;
}

export interface AdminSettings {
  _id?: ObjectId;
  restaurantName: string;
  whatsappNumber: string;
  bankDetails?: string;
  openingHours?: string;
  updatedAt: Date;
}
