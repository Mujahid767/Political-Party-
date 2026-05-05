import { prisma } from '@/lib/prisma';

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarColor: true,
      createdAt: true,
      _count: {
        select: { posts: true },
      },
    },
  });
  if (!user) return null;


  const [posts, donations, events, totalDonated, eventCount] = await Promise.all([
    // Recent posts
    prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true, content: true, imageUrl: true, createdAt: true,
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    // Donations
    prisma.donation.findMany({
      where: { donorId: userId },
      orderBy: { createdAt: 'desc' },
    }),
    // Event history
    prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true, title: true, location: true,
            startDate: true, endDate: true,
            createdBy: { select: { name: true } },
          },
        },
      },
      orderBy: { event: { startDate: 'desc' } },
    }),
    // Total donated (successful)
    prisma.donation.aggregate({
      where: { donorId: userId, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    // Events attended count
    prisma.eventParticipant.count({ where: { userId } }),
  ]);

  return {
    user: {
      ...user,
      totalDonated: totalDonated._sum.amount ?? 0,
      eventsAttended: eventCount,
    },
    posts,
    donations,
    events,
  };
}
