import { NextRequest, NextResponse } from 'next/server';
import { updateComplaint } from '@/controllers/complaint.controller';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try {
    const { id } = await params;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { status, adminNote } = await req.json();
    const data = await updateComplaint(id, status, adminNote);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
