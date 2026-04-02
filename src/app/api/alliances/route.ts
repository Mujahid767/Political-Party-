import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alliances = await prisma.alliance.findMany({
      include: {
        parties: {
          include: {
            party: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: alliances });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    const { name, founded } = body;
    const alliance = await prisma.alliance.create({
      data: { name, founded },
    });
    return NextResponse.json({ success: true, data: alliance });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
