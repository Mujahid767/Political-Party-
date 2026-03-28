import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const data = await prisma.user.findMany({ select:{id:true,email:true,name:true,role:true,createdAt:true}, orderBy:{createdAt:'desc'} });
  return NextResponse.json({ success:true, data });
}
export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    const reqRole = req.headers.get('x-user-role');
    if (reqRole !== 'ADMIN') return NextResponse.json({error:'Forbidden'},{status:403});
    const data = await prisma.user.update({ where:{id}, data:{role} });
    return NextResponse.json({ success:true, data });
  } catch(e:unknown) { return NextResponse.json({error:(e as Error).message},{status:400}); }
}
