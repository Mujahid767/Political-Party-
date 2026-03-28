import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/controllers/news.controller';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const data = await prisma.comment.findMany({ where:{newsId:id}, include:{user:{select:{name:true}}}, orderBy:{createdAt:'asc'} });
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id')!;
    const { content } = await req.json();
    const data = await addComment(id, content, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
