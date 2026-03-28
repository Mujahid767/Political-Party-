import { NextRequest, NextResponse } from 'next/server';
import { getConstituencies, getConstituencyRegions } from '@/controllers/constituency.controller';
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  if (s.get('regions') === 'true') {
    const data = await getConstituencyRegions();
    return NextResponse.json({ success:true, data });
  }
  const result = await getConstituencies(s.get('search')??undefined, s.get('region')??undefined, s.get('province')??undefined, parseInt(s.get('page')||'1'), parseInt(s.get('limit')||'20'));
  return NextResponse.json({ success:true, ...result });
}
