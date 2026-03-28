import { NextRequest, NextResponse } from 'next/server';
import { verifyRumor } from '@/controllers/rumor.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { status, clarification } = await req.json();
    const data = await verifyRumor(id, status, clarification);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
