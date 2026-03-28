import { NextRequest, NextResponse } from 'next/server';
import { getRumors, createRumor } from '@/controllers/rumor.controller';
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const data = await getRumors(status);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { title, description } = await req.json();
    const data = await createRumor(title, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
