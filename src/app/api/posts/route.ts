import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost, getUserLikes } from '@/controllers/post.controller';

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const userId = req.headers.get('x-user-id');
  const result = await getPosts(page, 12);
  let likedSet: Set<string> = new Set();
  if (userId) {
    likedSet = await getUserLikes(userId, result.data.map(p => p.id));
  }
  const data = result.data.map(p => ({ ...p, likedByMe: likedSet.has(p.id) }));
  return NextResponse.json({ success: true, data, total: result.total, pages: result.pages });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { content, imageUrl } = body;
    if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    const data = await createPost(content.trim(), userId, imageUrl || undefined);
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
