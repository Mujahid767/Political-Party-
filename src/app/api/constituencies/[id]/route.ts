import { NextRequest, NextResponse } from 'next/server';
import { assignMp } from '@/controllers/constituency.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const { mpId } = await req.json();
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const data = await assignMp(id, mpId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
