import { prisma } from '@/lib/prisma';

export async function getNews() {
  return prisma.news.findMany({
    include: { publishedBy:{select:{name:true}}, _count:{select:{comments:true,reactions:true}} },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createNews(title: string, content: string, userId: string, imageUrl?: string) {
  return prisma.news.create({ data:{ title, content, imageUrl, publishedById:userId } });
}

export async function addComment(newsId: string, content: string, userId: string) {
  return prisma.comment.create({ data:{ newsId, content, userId } });
}

export async function toggleReaction(newsId: string, userId: string, type: string) {
  const existing = await prisma.reaction.findUnique({ where:{newsId_userId:{newsId,userId}} });
  if (existing) { await prisma.reaction.delete({ where:{newsId_userId:{newsId,userId}} }); return null; }
  return prisma.reaction.create({ data:{ newsId, userId, type } });
}
