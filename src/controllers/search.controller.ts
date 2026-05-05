import { prisma } from '@/lib/prisma';

export async function searchUsers(query: string) {
  if (!query || query.trim().length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      name: { contains: query.trim(), mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { posts: true },
      },
    },
    take: 20,
    orderBy: { name: 'asc' },
  });

  const userIds = users.map((u: { id: string }) => u.id);

  const [eventCounts, donationTotals, donationCounts] = await Promise.all([
    prisma.eventParticipant.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { id: true },
    }),
    prisma.donation.groupBy({
      by: ['donorId'],
      where: { donorId: { in: userIds }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.donation.groupBy({
      by: ['donorId'],
      where: { donorId: { in: userIds } },
      _count: { id: true },
    }),
  ]);

  const eventMap   = new Map(eventCounts.map((e: { userId: string | null; _count: { id: number } }) => [e.userId, e._count.id]));
  const totalMap   = new Map(donationTotals.map((d: { donorId: string; _sum: { amount: number | null } }) => [d.donorId, d._sum.amount ?? 0]));
  const countMap   = new Map(donationCounts.map((d: { donorId: string; _count: { id: number } }) => [d.donorId, d._count.id]));

  return users.map((u: { id: string; name: string; role: string; createdAt: Date; _count: { posts: number } }) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    postCount: u._count.posts,
    donationCount: countMap.get(u.id) ?? 0,
    totalDonated: totalMap.get(u.id) ?? 0,
    eventsAttended: eventMap.get(u.id) ?? 0,
  }));
}

