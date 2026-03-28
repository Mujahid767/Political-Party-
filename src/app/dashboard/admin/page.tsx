import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function AdminDashboard() {
  const user = await getUser();
  if (!user || (user.role!=='ADMIN'&&user.role!=='CHAIRMAN')) redirect('/login');

  const [users, constTotal, constAssigned, openProposals, pendingComplaints, reviewRumors, newsCount, funds, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.constituency.count(),
    prisma.constituency.count({ where:{mpId:{not:null}} }),
    prisma.proposal.count({ where:{status:'OPEN'} }),
    prisma.complaint.count({ where:{status:'PENDING'} }),
    prisma.rumor.count({ where:{status:'UNDER_REVIEW'} }),
    prisma.news.count(),
    prisma.fund.groupBy({ by:['type'], _sum:{amount:true} }),
    prisma.activityLog.findMany({ take:8, orderBy:{createdAt:'desc'}, include:{user:{select:{name:true,role:true}}} }),
  ]);

  const totalIn = funds.find(f=>f.type==='DONATION')?._sum.amount ?? 0;
  const totalOut = funds.find(f=>f.type==='EXPENSE')?._sum.amount ?? 0;

  return (
    <DashboardLayout title="Admin Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Full system overview — {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <div className="stats-grid">
        <StatsCard label="Total Users" value={users} icon="👥" color="blue"/>
        <StatsCard label="Constituencies Assigned" value={constAssigned+'/'+constTotal} icon="🗺️" color="gold"/>
        <StatsCard label="Open Proposals" value={openProposals} icon="🗳️" color="purple"/>
        <StatsCard label="Pending Complaints" value={pendingComplaints} icon="📢" color="red"/>
        <StatsCard label="Rumors Under Review" value={reviewRumors} icon="🔍" color="cyan"/>
        <StatsCard label="News Articles" value={newsCount} icon="📰" color="green"/>
        <StatsCard label="Total Donations" value={"৳"+totalIn.toLocaleString()} icon="💰" color="green"/>
        <StatsCard label="Total Expenses" value={"৳"+totalOut.toLocaleString()} icon="📤" color="red"/>
      </div>

      <div className="grid-2" style={{gap:'1.25rem'}}>
        <div className="card">
          <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>💰 Financial Summary</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem',background:'rgba(16,185,129,0.08)',borderRadius:8,border:'1px solid rgba(16,185,129,0.2)'}}>
              <span style={{color:'#10b981',fontWeight:600}}>Total Donations</span>
              <span style={{fontWeight:700,fontSize:'1.1rem'}}>৳{totalIn.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem',background:'rgba(239,68,68,0.08)',borderRadius:8,border:'1px solid rgba(239,68,68,0.2)'}}>
              <span style={{color:'#ef4444',fontWeight:600}}>Total Expenses</span>
              <span style={{fontWeight:700,fontSize:'1.1rem'}}>৳{totalOut.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem',background:'rgba(245,158,11,0.08)',borderRadius:8,border:'1px solid rgba(245,158,11,0.2)'}}>
              <span style={{color:'var(--gold)',fontWeight:600}}>Net Balance</span>
              <span style={{fontWeight:700,fontSize:'1.25rem',color:'var(--gold)'}}>৳{(totalIn-totalOut).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>📋 Recent Activity</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {recentActivity.length===0?<p className="text-muted">No recent activity</p>:recentActivity.map(log=>(
              <div key={log.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',flexShrink:0}}>
                  {log.action==='LOGIN'?'🔐':log.action==='VOTE'?'🗳️':'📝'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'0.8rem',fontWeight:500}}>{log.user.name} — {log.action}</div>
                  <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{log.entity} • {new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
                <Badge status={log.user.role}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
