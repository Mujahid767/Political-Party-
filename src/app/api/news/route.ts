import { NextRequest, NextResponse } from 'next/server';
import { getNews, createNews } from '@/controllers/news.controller';
export async function GET() {
  const data = await getNews();
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({error:'Only admin can publish news'},{status:403});
    const { title, content, imageUrl } = await req.json();
    const data = await createNews(title, content, userId, imageUrl);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
