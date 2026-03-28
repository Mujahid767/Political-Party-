import { NextRequest, NextResponse } from 'next/server';
import { getProposals, createProposal } from '@/controllers/proposal.controller';
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const data = await getProposals(status);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MINISTER' && role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const { title, description } = await req.json();
    const data = await createProposal(title, description, userId);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
