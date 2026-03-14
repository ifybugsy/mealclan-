import { connectToDatabase } from '@/lib/mongodb';
import { MenuItem } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection<MenuItem>('menu_items').find({ available: true }).toArray();
    console.log('[v0] Successfully fetched menu items:', items.length);
    return NextResponse.json(items);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching menu:', errorMessage);
    // Return empty array on error instead of 500, so the UI can still load
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const menuItem: MenuItem = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      image: body.image,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('menu_items').insertOne(menuItem);
    return NextResponse.json({ _id: result.insertedId, ...menuItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
