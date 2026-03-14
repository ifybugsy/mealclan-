import { NextRequest, NextResponse } from 'next/server';

// This file is needed for socket.io to work with Next.js
// The actual socket.io server is initialized in the pages/api/socket.io.js equivalent
// For production, consider using a dedicated WebSocket server or service

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Socket.io server is running' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Socket.io server is running' });
}
