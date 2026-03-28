import { NextRequest, NextResponse } from 'next/server';
import { getFunds, createFund, getFundSummary } from '@/controllers/fund.controller';
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? undefined;
  const summary = req.nextUrl.searchParams.get('summary') === 'true';
  if (summary) { const data = await getFundSummary(); return NextResponse.json({success:true,data}); }
  const data = await getFunds(type);
  return NextResponse.json({ success:true, data });
}
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'CHAIRMAN') return NextResponse.json({error:'Forbidden'},{status:403});
    const body = await req.json();
    const data = await createFund({ ...body, recordedById: userId });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
