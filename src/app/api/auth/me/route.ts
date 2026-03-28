import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const id = req.headers.get('x-user-id');
  if (!id) return NextResponse.json({error:'Unauthorized'},{status:401});
  const user = await prisma.user.findUnique({ where:{id}, select:{id:true,email:true,name:true,role:true,createdAt:true} });
  return NextResponse.json({ success:true, data:user });
}
