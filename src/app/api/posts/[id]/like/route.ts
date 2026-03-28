import { NextRequest, NextResponse } from 'next/server';
import { toggleLike } from '@/controllers/post.controller';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const result = await toggleLike(id, userId);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
