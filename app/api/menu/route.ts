import { connectToDatabase } from '@/lib/mongodb';
import { MenuItem } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection<MenuItem>('menu_items').find({}).sort({ createdAt: -1 }).toArray();
    
    // Convert ObjectId to string for JSON response
    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id?.toString(),
    }));

    console.log('[API] Successfully fetched menu items:', formattedItems.length);
    return NextResponse.json(formattedItems);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API] Error fetching menu:', errorMessage);
    // Return empty array on error instead of 500, so the UI can still load
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const menuItem: MenuItem = {
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      category: body.category || 'Main Course',
      image: body.image || '',
      available: body.available !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('menu_items').insertOne(menuItem);
    
    // Convert ObjectId to string for JSON response
    const createdItem = {
      _id: result.insertedId.toString(),
      ...menuItem,
    };

    console.log('[API] Menu item created successfully:', createdItem._id);
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
