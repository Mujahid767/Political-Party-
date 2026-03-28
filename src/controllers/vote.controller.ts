import { prisma } from '@/lib/prisma';

export async function castVote(proposalId: string, ministerId: string, choice: 'YES'|'NO'|'ABSTAIN') {
  const proposal = await prisma.proposal.findUnique({ where:{id:proposalId} });
  if (!proposal || proposal.status !== 'OPEN') throw new Error('Proposal is not open for voting');
  const existing = await prisma.vote.findUnique({ where:{ proposalId_ministerId:{proposalId,ministerId} } });
  if (existing) throw new Error('You have already voted on this proposal');
  const vote = await prisma.vote.create({ data:{ choice, proposalId, ministerId } });
  await prisma.activityLog.create({ data:{ action:'VOTE', entity:'Proposal', entityId:proposalId, meta:choice, userId:ministerId } });
  return vote;
}

export async function getVoteResults(proposalId: string) {
  const votes = await prisma.vote.findMany({ where:{proposalId}, include:{ minister:{select:{name:true}} } });
  const yes = votes.filter(v=>v.choice==='YES').length;
  const no = votes.filter(v=>v.choice==='NO').length;
  const abstain = votes.filter(v=>v.choice==='ABSTAIN').length;
  return { yes, no, abstain, total: votes.length, votes };
}
