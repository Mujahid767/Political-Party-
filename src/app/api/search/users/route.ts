import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/controllers/search.controller';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q') ?? '';
  const data = await searchUsers(q);
  return NextResponse.json({ success: true, data });
}
