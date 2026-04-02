import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      include: {
        alliances: {
          include: {
            alliance: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: parties });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    const { name, leader, ideology, parliamentaryPosition, allianceId } = body;
    const party = await prisma.party.create({
      data: {
        name, leader, ideology, parliamentaryPosition,
        ...(allianceId ? { alliances: { create: { allianceId } } } : {}),
      },
      include: { alliances: { include: { alliance: true } } },
    });
    return NextResponse.json({ success: true, data: party });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
