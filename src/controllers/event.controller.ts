import { prisma } from '@/lib/prisma';

export async function getEvents() {
  return prisma.event.findMany({
    include: { createdBy:{select:{name:true}}, _count:{select:{participants:true}} },
    orderBy: { startDate: 'desc' },
  });
}

export async function createEvent(data: { title:string; description:string; location:string; startDate:string; endDate:string; createdById:string }) {
  return prisma.event.create({ data:{ ...data, startDate:new Date(data.startDate), endDate:new Date(data.endDate) } });
}

export async function registerParticipant(eventId: string, name: string, email: string, userId?: string, role?: string) {
  const existing = await prisma.eventParticipant.findUnique({ where:{eventId_email:{eventId,email}} });
  if (existing) throw new Error('Already registered');
  return prisma.eventParticipant.create({ data:{ eventId, name, email, userId, role } });
}

export async function getUserEventHistory(userId: string) {
  return prisma.eventParticipant.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true, title: true, description: true, location: true,
          startDate: true, endDate: true,
          createdBy: { select: { name: true } },
        },
      },
    },
    orderBy: { event: { startDate: 'desc' } },
  });
}

export async function getEventParticipants(eventId: string) {
  return prisma.eventParticipant.findMany({
    where: { eventId },
    orderBy: { id: 'asc' },
  });
}
