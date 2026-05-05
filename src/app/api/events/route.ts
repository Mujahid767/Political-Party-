import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/controllers/event.controller';

const NON_PUBLIC_ROLES = ['ADMIN','PARTY_ADMIN','CHAIRMAN','MINISTER','MP'];

export async function GET() {
  const data = await getEvents();
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (!role || !NON_PUBLIC_ROLES.includes(role))
      return NextResponse.json({error:'Forbidden — only non-public roles can create events'},{status:403});
    const body = await req.json();
    const data = await createEvent({ ...body, createdById: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
