import { NextRequest, NextResponse } from 'next/server';
import { castVote, getVoteResults } from '@/controllers/vote.controller';
export async function GET(req: NextRequest) {
  const proposalId = req.nextUrl.searchParams.get('proposalId');
  if (!proposalId) return NextResponse.json({error:'proposalId required'},{status:400});
  const data = await getVoteResults(proposalId);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'MINISTER') return NextResponse.json({error:'Only ministers can vote'},{status:403});
    const { proposalId, choice } = await req.json();
    const data = await castVote(proposalId, userId, choice);
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
