import { getDatabase } from './database.js';

export async function initializeCollections() {
  const db = await getDatabase();

  try {
    // Create collections with validation
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Menu Items Collection
    if (!collectionNames.includes('menu_items')) {
      await db.createCollection('menu_items');
      await db.collection('menu_items').createIndex({ name: 1 });
      await db.collection('menu_items').createIndex({ category: 1 });
      console.log('[v0] Created menu_items collection');
    }

    // Orders Collection
    if (!collectionNames.includes('orders')) {
      await db.createCollection('orders');
      await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
      await db.collection('orders').createIndex({ status: 1 });
      await db.collection('orders').createIndex({ createdAt: -1 });
      console.log('[v0] Created orders collection');
    }

    // Settings Collection
    if (!collectionNames.includes('settings')) {
      await db.createCollection('settings');
      await db.collection('settings').createIndex({ key: 1 }, { unique: true });
      console.log('[v0] Created settings collection');
    }

    // Users Collection
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('[v0] Created users collection');
    }

    console.log('[v0] Database schema initialization completed');
  } catch (error) {
    console.error('[v0] Error initializing collections:', error.message);
    throw error;
  }
}
