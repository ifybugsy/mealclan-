import { connectToDatabase } from '@/lib/mongodb';
import { AdminSettings } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    let settings = await db.collection<AdminSettings>('settings').findOne({});

    if (!settings) {
      // Initialize default settings
      const defaultSettings: AdminSettings = {
        restaurantName: 'MealClan',
        whatsappNumber: '08038753508',
        updatedAt: new Date(),
      };

      await db.collection('settings').insertOne(defaultSettings);
      settings = defaultSettings;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const result = await db.collection('settings').updateOne(
      {},
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
