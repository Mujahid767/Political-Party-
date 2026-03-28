import { NextRequest, NextResponse } from 'next/server';
import { getMeetings, createMeeting } from '@/controllers/meeting.controller';
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')!;
  const role = req.headers.get('x-user-role');
  const mpId = (role === 'MP') ? userId : req.nextUrl.searchParams.get('mpId') ?? undefined;
  const data = await getMeetings(mpId, req.nextUrl.searchParams.get('status') ?? undefined);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MP' && role !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const data = await createMeeting({ ...body, mpId: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
