import { NextRequest, NextResponse } from 'next/server';
import { getPostComments, addComment } from '@/controllers/post.controller';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPostComments(id);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    const data = await addComment(id, userId, content.trim());
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
