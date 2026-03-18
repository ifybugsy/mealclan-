import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const item = await db
      .collection('menu_items')
      .findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const result = await db.collection('menu_items').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: body.name,
          description: body.description,
          price: body.price,
          category: body.category,
          image: body.image,
          available: body.available,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const updatedItem = {
      ...result.value,
      _id: result.value._id?.toString(),
    };

    console.log('[API] Menu item updated successfully:', params.id);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    // First, find the item to return it
    const item = await db
      .collection('menu_items')
      .findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    const result = await db
      .collection('menu_items')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const deletedItem = {
      ...item,
      _id: item._id?.toString(),
    };

    console.log('[API] Menu item deleted successfully:', params.id);
    return NextResponse.json(deletedItem);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
