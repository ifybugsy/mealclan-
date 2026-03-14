import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching gallery items from MongoDB');
    
    const { db } = await connectToDatabase();
    const items = await db.collection('gallery_items').find({}).toArray();
    
    console.log('[v0] Successfully fetched gallery items:', items.length);
    return NextResponse.json(items || []);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error fetching gallery:', errorMessage);
    // Return empty array on error instead of 500, so the UI can still load
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    const galleryItem = {
      title: body.title,
      description: body.description || '',
      image: body.image,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('gallery_items').insertOne(galleryItem);
    console.log('[v0] Gallery item created:', result.insertedId);
    
    return NextResponse.json({ _id: result.insertedId, ...galleryItem }, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}
