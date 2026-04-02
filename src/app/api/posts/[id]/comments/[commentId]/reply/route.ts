import { NextRequest, NextResponse } from 'next/server';
import { addReply } from '@/controllers/post.controller';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: postId, commentId } = await params;
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 });
    const data = await addReply(postId, commentId, userId, content.trim());
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
