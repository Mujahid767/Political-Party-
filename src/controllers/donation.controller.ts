import { prisma } from '@/lib/prisma';

// ── bKash Tokenized Checkout (Sandbox / Live) ────────────────────────────────
const BKASH_BASE = process.env.BKASH_BASE_URL ?? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const APP_KEY    = process.env.BKASH_APP_KEY ?? '';
const APP_SECRET = process.env.BKASH_APP_SECRET ?? '';
const USERNAME   = process.env.BKASH_USERNAME ?? '';
const PASSWORD   = process.env.BKASH_PASSWORD ?? '';

async function bkashToken(): Promise<string> {
  const res = await fetch(`${BKASH_BASE}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      username: USERNAME,
      password: PASSWORD,
    },
    body: JSON.stringify({ app_key: APP_KEY, app_secret: APP_SECRET }),
  });
  const d = await res.json();
  if (!d.id_token) throw new Error('bKash token grant failed: ' + JSON.stringify(d));
  return d.id_token as string;
}

// ── Initiate Donation ────────────────────────────────────────────────────────
export async function initiateDonation(
  donorId: string,
  amount: number,
  partyName: string,
  callbackUrl: string,
): Promise<{ bkashURL: string; donationId: string }> {
  // Create a PENDING donation record first
  const donation = await prisma.donation.create({
    data: { amount, partyName, donorId, status: 'PENDING' },
  });

  // If bKash creds not set → mock mode
  if (!APP_KEY || !APP_SECRET || !USERNAME || !PASSWORD) {
    return { bkashURL: `${callbackUrl}?mock=1&donationId=${donation.id}`, donationId: donation.id };
  }

  const token = await bkashToken();
  const res = await fetch(`${BKASH_BASE}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': APP_KEY,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: donorId,
      callbackURL: `${callbackUrl}?donationId=${donation.id}`,
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: donation.id,
    }),
  });
  const d = await res.json();
  if (!d.bkashURL) throw new Error('bKash create failed: ' + JSON.stringify(d));

  await prisma.donation.update({
    where: { id: donation.id },
    data: { bkashPaymentId: d.paymentID },
  });

  return { bkashURL: d.bkashURL as string, donationId: donation.id };
}

// ── Confirm Donation ─────────────────────────────────────────────────────────
export async function confirmDonation(
  donationId: string,
  paymentID: string,
  isMock = false,
): Promise<{ success: boolean; donation: object }> {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new Error('Donation not found');

  let trxId = isMock ? `MOCK_${Date.now()}` : null;

  if (!isMock) {
    const token = await bkashToken();
    const res = await fetch(`${BKASH_BASE}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        'X-APP-Key': APP_KEY,
      },
      body: JSON.stringify({ paymentID }),
    });
    const d = await res.json();
    if (d.statusCode !== '0000') {
      await prisma.donation.update({ where: { id: donationId }, data: { status: 'FAILED' } });
      return { success: false, donation };
    }
    trxId = d.trxID as string;
  }

  const updated = await prisma.donation.update({
    where: { id: donationId },
    data: { status: 'SUCCESS', bkashTrxId: trxId, bkashPaymentId: paymentID },
  });

  // Record as a Fund entry too
  const donor = await prisma.user.findUnique({ where: { id: donation.donorId } });
  await prisma.fund.create({
    data: {
      type: 'DONATION',
      amount: donation.amount,
      description: `bKash donation from ${donor?.name ?? 'Public User'} (TrxID: ${trxId})`,
      category: 'Public Donation',
      partyName: donation.partyName,
      recordedById: donation.donorId,
    },
  });

  return { success: true, donation: updated };
}

// ── Get Party Donation Totals ────────────────────────────────────────────────
export async function getPartyDonationTotals() {
  const rows = await prisma.donation.groupBy({
    by: ['partyName'],
    where: { status: 'SUCCESS' },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
  return rows.map(r => ({
    partyName: r.partyName,
    total: r._sum.amount ?? 0,
    count: r._count.id,
  }));
}

// ── Get User Donations ───────────────────────────────────────────────────────
export async function getUserDonations(userId: string) {
  return prisma.donation.findMany({
    where: { donorId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ── Get All Donations (admin) ────────────────────────────────────────────────
export async function getAllDonations() {
  return prisma.donation.findMany({
    include: { donor: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
