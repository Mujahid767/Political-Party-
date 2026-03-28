import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function MinisterDashboard() {
  const user = await getUser();
  if (!user || user.role!=='MINISTER') redirect('/login');
  const [myProposals, myVotes, openProposals] = await Promise.all([
    prisma.proposal.count({ where:{createdById:user.sub} }),
    prisma.vote.count({ where:{ministerId:user.sub} }),
    prisma.proposal.findMany({ where:{status:'OPEN'}, include:{createdBy:{select:{name:true}},votes:true}, orderBy:{createdAt:'desc'}, take:5 }),
  ]);
  return (
    <DashboardLayout title="Minister Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">Minister Workspace</h1></div>
      <div className="stats-grid">
        <StatsCard label="My Proposals" value={myProposals} icon="📋" color="gold"/>
        <StatsCard label="Votes Cast" value={myVotes} icon="🗳️" color="blue"/>
        <StatsCard label="Open for Voting" value={openProposals.length} icon="⏳" color="purple"/>
      </div>
      <div className="card mt-4">
        <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>🗳️ Open Proposals — Awaiting Your Vote</h2>
        {openProposals.length===0?<p className="text-muted">No open proposals</p>:openProposals.map(p=>{
          const hasVoted = p.votes.some(v=>v.ministerId===user.sub);
          return (
            <div key={p.id} style={{padding:'0.875rem',background:'var(--navy)',borderRadius:8,marginBottom:'0.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontWeight:600,marginBottom:'0.2rem'}}>{p.title}</div><div className="text-muted text-sm">by {p.createdBy.name} • {p.votes.length} votes</div></div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                {hasVoted?<Badge status="RESOLVED"/>:<a href="/dashboard/proposals" className="btn btn-primary btn-sm">Vote Now</a>}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
