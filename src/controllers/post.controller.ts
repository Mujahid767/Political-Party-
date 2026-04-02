import { prisma } from '@/lib/prisma';

const POST_SELECT = {
  id: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
  _count: { select: { comments: true, likes: true } },
};

export async function getPosts(page = 1, limit = 20) {
  const [data, total] = await Promise.all([
    prisma.post.findMany({
      select: POST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count(),
  ]);
  return { data, total, page, pages: Math.ceil(total / limit) };
}

export async function createPost(content: string, authorId: string, imageUrl?: string) {
  return prisma.post.create({
    data: { content, authorId, imageUrl },
    select: POST_SELECT,
  });
}

export async function deletePost(id: string, userId: string, role: string) {
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) throw new Error('Post not found');
  if (post.authorId !== userId && role !== 'ADMIN' && role !== 'CHAIRMAN')
    throw new Error('Not authorized to delete this post');
  await prisma.post.delete({ where: { id } });
}

const COMMENT_AUTHOR_SELECT = { id: true, name: true, role: true };

export async function getPostComments(postId: string) {
  return prisma.postComment.findMany({
    where: { postId, parentId: null }, // only top-level
    select: {
      id: true, content: true, createdAt: true,
      author: { select: COMMENT_AUTHOR_SELECT },
      replies: {
        select: {
          id: true, content: true, createdAt: true,
          author: { select: COMMENT_AUTHOR_SELECT },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addComment(postId: string, authorId: string, content: string) {
  await prisma.post.findUniqueOrThrow({ where: { id: postId } });
  return prisma.postComment.create({
    data: { postId, authorId, content },
    select: {
      id: true, content: true, createdAt: true,
      author: { select: COMMENT_AUTHOR_SELECT },
      replies: true,
    },
  });
}

export async function addReply(postId: string, parentCommentId: string, authorId: string, content: string) {
  const parent = await prisma.postComment.findUniqueOrThrow({ where: { id: parentCommentId } });
  if (parent.postId !== postId) throw new Error('Comment does not belong to this post');
  return prisma.postComment.create({
    data: { postId, authorId, content, parentId: parentCommentId },
    select: {
      id: true, content: true, createdAt: true, parentId: true,
      author: { select: COMMENT_AUTHOR_SELECT },
    },
  });
}

export async function toggleLike(postId: string, userId: string) {
  const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId, userId } } });
  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
    return { liked: false };
  }
  await prisma.postLike.create({ data: { postId, userId } });
  return { liked: true };
}

export async function getUserLikes(userId: string, postIds: string[]): Promise<Set<string>> {
  const likes = await prisma.postLike.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true } });
  return new Set<string>(likes.map((l: { postId: string }) => l.postId));
}
