import { prisma } from '@/lib/prisma';

export async function getMeetings(mpId?: string, status?: string) {
  return prisma.meeting.findMany({
    where: { ...(mpId?{mpId}:{}), ...(status?{status:status as never}:{}) },
    include: { mp: { select:{name:true} } },
    orderBy: { scheduledAt: 'desc' },
  });
}

export async function createMeeting(data: { title:string; agenda:string; scheduledAt:string; location?:string; mpId:string }) {
  return prisma.meeting.create({ data: { ...data, scheduledAt: new Date(data.scheduledAt) } });
}

export async function updateMeetingStatus(id: string, status: 'SCHEDULED'|'COMPLETED'|'CANCELLED') {
  return prisma.meeting.update({ where:{id}, data:{status} });
}
