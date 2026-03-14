import { clearAdminCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await clearAdminCookie();
    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
