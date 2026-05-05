import { NextRequest, NextResponse } from 'next/server';
import { getPublicProfile } from '@/controllers/profile.controller';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const currentUserId = req.headers.get('x-user-id');
  if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await params;
  const data = await getPublicProfile(userId);
  if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}
