import { connectToDatabase } from '@/lib/mongodb';
import { createToken, setAdminCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models';

// Simple authentication - in production, use proper password hashing
const ADMIN_EMAIL = 'admin@mealclan.com';
const ADMIN_PASSWORD = 'mealclan2024'; // Change this to environment variable

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = await createToken({ email, role: 'admin' });
      await setAdminCookie(token);

      return NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
