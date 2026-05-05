import { NextRequest, NextResponse } from 'next/server';
import { initiateDonation, getUserDonations, getAllDonations } from '@/controllers/donation.controller';
import { getPartyDonationTotals } from '@/controllers/donation.controller';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const role   = req.headers.get('x-user-role');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const totals = req.nextUrl.searchParams.get('totals') === 'true';
  if (totals) {
    const data = await getPartyDonationTotals();
    return NextResponse.json({ success: true, data });
  }

  if (role === 'ADMIN' || role === 'PARTY_ADMIN') {
    const data = await getAllDonations();
    return NextResponse.json({ success: true, data });
  }

  const data = await getUserDonations(userId);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { amount, partyName, mock } = body;

    if (!amount || !partyName) return NextResponse.json({ error: 'amount and partyName are required' }, { status: 400 });
    if (typeof amount !== 'number' || amount < 10)
      return NextResponse.json({ error: 'Minimum donation is 10 BDT' }, { status: 400 });

    // Verify party exists
    const party = await prisma.party.findFirst({ where: { name: partyName } });
    if (!party) return NextResponse.json({ error: 'Party not found' }, { status: 404 });

    const host = req.nextUrl.origin;
    const callbackUrl = `${host}/api/donations/confirm`;

    if (mock) {
      // Mock payment path — no real bKash call
      const donation = await prisma.donation.create({ data: { amount, partyName, donorId: userId, status: 'PENDING' } });
      return NextResponse.json({ success: true, mock: true, donationId: donation.id });
    }

    const result = await initiateDonation(userId, amount, partyName, callbackUrl);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
