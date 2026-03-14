import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Remove any extra @ symbols and ensure proper format
  let uri = process.env.MONGODB_URI;
  uri = uri.replace(/@@/g, '@'); // Fix double @ if present

  console.log('[v0] Connecting to MongoDB with URI:', uri.replace(/:[^@]*@/, ':****@'));

  const client = new MongoClient(uri, {
    tlsInsecure: true, // Allow self-signed certificates in development
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: false,
    retryReads: false,
  });

  try {
    await client.connect();
    console.log('[v0] Successfully connected to MongoDB');
    const db = client.db('mealclan');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('[v0] MongoDB connection failed:', error instanceof Error ? error.message : String(error));
    // Don't cache failed connections
    await client.close().catch(() => {});
    throw error;
  }
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
