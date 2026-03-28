import { prisma } from '@/lib/prisma';

export async function getComplaints(status?: string) {
  return prisma.complaint.findMany({
    where: status ? { status: status as never } : undefined,
    include: { submittedBy:{select:{name:true,email:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createComplaint(subject: string, description: string, userId: string) {
  return prisma.complaint.create({ data:{ subject, description, submittedById:userId } });
}

export async function updateComplaint(id: string, status: string, adminNote?: string) {
  return prisma.complaint.update({ where:{id}, data:{ status:status as never, adminNote } });
}
