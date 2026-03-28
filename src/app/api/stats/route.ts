import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const [users, constituencies, proposals, complaints, rumors, news, funds] = await Promise.all([
    prisma.user.count(),
    prisma.constituency.count({ where:{ mpId:{not:null} } }),
    prisma.proposal.count({ where:{status:'OPEN'} }),
    prisma.complaint.count({ where:{status:'PENDING'} }),
    prisma.rumor.count({ where:{status:'UNDER_REVIEW'} }),
    prisma.news.count(),
    prisma.fund.aggregate({ _sum:{amount:true}, where:{type:'DONATION'} }),
  ]);
  return NextResponse.json({ success:true, data:{ users, assignedConstituencies:constituencies, openProposals:proposals, pendingComplaints:complaints, pendingRumors:rumors, newsCount:news, totalDonations:funds._sum.amount??0 } });
}
