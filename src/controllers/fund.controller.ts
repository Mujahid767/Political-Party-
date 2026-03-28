import { prisma } from '@/lib/prisma';

export async function getFunds(type?: string) {
  return prisma.fund.findMany({
    where: type ? { type: type as never } : undefined,
    include: { recordedBy:{select:{name:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createFund(data: { type:'DONATION'|'EXPENSE'; amount:number; description:string; category:string; recordedById:string }) {
  return prisma.fund.create({ data });
}

export async function getFundSummary() {
  const [donations, expenses] = await Promise.all([
    prisma.fund.aggregate({ where:{type:'DONATION'}, _sum:{amount:true} }),
    prisma.fund.aggregate({ where:{type:'EXPENSE'}, _sum:{amount:true} }),
  ]);
  const totalIn = donations._sum.amount ?? 0;
  const totalOut = expenses._sum.amount ?? 0;
  return { totalIn, totalOut, balance: totalIn - totalOut };
}
