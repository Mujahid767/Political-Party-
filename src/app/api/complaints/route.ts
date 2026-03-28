import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, createComplaint } from '@/controllers/complaint.controller';
export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role');
  const userId = req.headers.get('x-user-id')!;
  if (role !== 'ADMIN' && role !== 'CHAIRMAN') {
    const data = await getComplaints();
    const mine = (data as {submittedById:string}[]).filter(c=>c.submittedById===userId);
    return NextResponse.json({success:true,data:mine});
  }
  const data = await getComplaints(req.nextUrl.searchParams.get('status')??undefined);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const { subject, description } = await req.json();
    const data = await createComplaint(subject, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
