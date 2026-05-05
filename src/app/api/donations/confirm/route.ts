import { NextRequest, NextResponse } from 'next/server';
import { confirmDonation } from '@/controllers/donation.controller';

// Called by bKash redirect or mock confirm
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const donationId = searchParams.get('donationId');
  const paymentID  = searchParams.get('paymentID') ?? '';
  const isMock     = searchParams.get('mock') === '1';
  const status     = searchParams.get('status'); // bKash sends status=success|failure|cancel

  if (!donationId)
    return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });

  if (status === 'failure' || status === 'cancel') {
    const { prisma } = await import('@/lib/prisma');
    await prisma.donation.update({ where: { id: donationId }, data: { status: 'FAILED' } });
    return NextResponse.redirect(new URL(`/dashboard/donate?status=cancelled`, req.nextUrl.origin));
  }

  try {
    const result = await confirmDonation(donationId, paymentID, isMock);
    const s = result.success ? 'success' : 'failed';
    return NextResponse.redirect(new URL(`/dashboard/donate?status=${s}&donationId=${donationId}`, req.nextUrl.origin));
  } catch (e) {
    console.error('Donation confirm error', e);
    return NextResponse.redirect(new URL(`/dashboard/donate?status=error`, req.nextUrl.origin));
  }
}
