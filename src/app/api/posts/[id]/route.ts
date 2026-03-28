import { NextRequest, NextResponse } from 'next/server';
import { deletePost } from '@/controllers/post.controller';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await deletePost(id, userId, role ?? 'PUBLIC');
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
