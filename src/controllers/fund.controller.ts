import { prisma } from '@/lib/prisma';

export async function getFunds(type?: string, filter?: Record<string, any>) {
  return prisma.fund.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...filter,
    },
    include: { recordedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFund(data: { type: 'DONATION' | 'EXPENSE'; amount: number; description: string; category: string; recordedById: string; partyName?: string; constituencyId?: string }) {
  return prisma.fund.create({ data });
}

export async function getFundSummary(filter?: Record<string, any>) {
  const [donations, expenses] = await Promise.all([
    prisma.fund.aggregate({ where: { type: 'DONATION', ...filter }, _sum: { amount: true } }),
    prisma.fund.aggregate({ where: { type: 'EXPENSE', ...filter }, _sum: { amount: true } }),
  ]);
  const totalIn = donations._sum.amount ?? 0;
  const totalOut = expenses._sum.amount ?? 0;
  return { totalIn, totalOut, balance: totalIn - totalOut };
}
