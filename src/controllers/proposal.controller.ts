import { prisma } from '@/lib/prisma';

export async function getProposals(status?: string) {
  return prisma.proposal.findMany({
    where: status ? { status: status as never } : undefined,
    include: { createdBy: { select:{name:true,role:true} }, votes: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProposal(title: string, description: string, userId: string) {
  return prisma.proposal.create({ data: { title, description, createdById: userId } });
}

export async function closeProposal(id: string) {
  const proposal = await prisma.proposal.findUnique({ where:{id}, include:{votes:true} });
  if (!proposal) throw new Error('Proposal not found');
  const yes = proposal.votes.filter(v=>v.choice==='YES').length;
  const no = proposal.votes.filter(v=>v.choice==='NO').length;
  const status = yes > no ? 'PASSED' : 'REJECTED';
  return prisma.proposal.update({ where:{id}, data:{ status, closedAt: new Date() } });
}
