import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const status = request.nextUrl.searchParams.get('status');

    const query = status ? { status } : {};
    const orders = await db
      .collection<Order>('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching orders:', errorMessage);
    // Return empty array on error so UI can still load
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    console.log('[v0] POST /api/orders - Received body:', body);

    const order: Order = {
      orderNumber: generateOrderNumber(),
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      items: body.items,
      totalPrice: body.totalPrice,
      status: 'pending',
      deliveryType: body.deliveryType,
      deliveryAddress: body.deliveryAddress,
      specialInstructions: body.specialInstructions,
      paymentMethod: body.paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[v0] POST /api/orders - Order object before insert:', order);

    const result = await db.collection('orders').insertOne(order);
    
    const response = { _id: result.insertedId, ...order };
    console.log('[v0] POST /api/orders - Response:', response);
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
