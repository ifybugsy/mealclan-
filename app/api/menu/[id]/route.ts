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
    if (!ObjectId.isValid(params.id)) {
      console.log('[API] Invalid ObjectId format:', params.id);
      return NextResponse.json(
        { error: 'Invalid menu item ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided in the request
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.available !== undefined) updateData.available = body.available;
    if (body.finished !== undefined) updateData.finished = body.finished;

    const result = await db.collection('menu_items').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      console.log('[API] Menu item not found:', params.id);
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const updatedItem = {
      ...result.value,
      _id: result.value._id?.toString(),
    };

    console.log('[API] Menu item updated successfully:', params.id, 'Updates:', Object.keys(updateData));
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('[API] Error updating menu item:', error);
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
    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      console.log('[API] Invalid ObjectId format:', params.id);
      return NextResponse.json(
        { error: 'Invalid menu item ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // First, find the item to return it
    const item = await db
      .collection('menu_items')
      .findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      console.log('[API] Menu item not found:', params.id);
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
      console.log('[API] Failed to delete menu item:', params.id);
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const deletedItem = {
      ...item,
      _id: item._id?.toString(),
    };

    console.log('[API] Menu item deleted successfully:', params.id, 'Name:', item.name);
    return NextResponse.json(deletedItem, { status: 200 });
  } catch (error) {
    console.error('[API] Error deleting menu item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
