import { NextRequest, NextResponse } from 'next/server';
import { getFunds, createFund, getFundSummary } from '@/controllers/fund.controller';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? undefined;
  const summary = req.nextUrl.searchParams.get('summary') === 'true';
  const role = req.headers.get('x-user-role');
  const userId = req.headers.get('x-user-id');
  
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { constituency: true } });
  
  let filter: Record<string, any> = {};
  if (role === 'PARTY_ADMIN') {
    filter = { partyName: user?.partyName };
  } else if (role === 'MP') {
    filter = { constituencyId: user?.constituency?.id };
  } else if (role !== 'ADMIN' && role !== 'CHAIRMAN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (summary) { 
    const data = await getFundSummary(filter); 
    return NextResponse.json({ success: true, data }); 
  }
  const data = await getFunds(type, filter);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')!;
    const role = req.headers.get('x-user-role');
    
    if (role !== 'ADMIN' && role !== 'CHAIRMAN' && role !== 'PARTY_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const data = await createFund({ 
      ...body, 
      recordedById: userId,
      partyName: role === 'PARTY_ADMIN' ? user?.partyName : body.partyName,
      constituencyId: body.constituencyId // optionally passed for MP area
    });
    return NextResponse.json({ success: true, data });
  } catch(e: unknown) { 
    return NextResponse.json({ error: (e as Error).message }, { status: 400 }); 
  }
}
