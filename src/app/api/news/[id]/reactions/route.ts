import { NextRequest, NextResponse } from 'next/server';
import { toggleReaction } from '@/controllers/news.controller';
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id')!;
    const { type } = await req.json();
    const data = await toggleReaction(id, userId, type);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
