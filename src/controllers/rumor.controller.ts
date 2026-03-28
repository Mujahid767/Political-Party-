import { prisma } from '@/lib/prisma';

export async function getRumors(status?: string) {
  return prisma.rumor.findMany({
    where: status ? { status: status as never } : undefined,
    include: { reportedBy:{select:{name:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createRumor(title: string, description: string, userId: string) {
  return prisma.rumor.create({ data:{ title, description, reportedById:userId } });
}

export async function verifyRumor(id: string, status: string, clarification?: string) {
  return prisma.rumor.update({ where:{id}, data:{ status:status as never, clarification } });
}
