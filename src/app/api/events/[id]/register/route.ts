import { NextRequest, NextResponse } from 'next/server';
import { registerParticipant } from '@/controllers/event.controller';
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') ?? undefined;
    const { name, email, role } = await req.json();
    const data = await registerParticipant(id, name, email, userId, role);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
