import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function MpDashboard() {
  const user = await getUser();
  if (!user || user.role!=='MP') redirect('/login');
  const [constituency, meetings] = await Promise.all([
    prisma.constituency.findUnique({ where:{mpId:user.sub} }),
    prisma.meeting.findMany({ where:{mpId:user.sub}, orderBy:{scheduledAt:'desc'}, take:5 }),
  ]);
  return (
    <DashboardLayout title="MP Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">MP Workspace</h1></div>
      <div className="stats-grid">
        <StatsCard label="My Constituency" value={constituency?.name ?? 'Unassigned'} icon="🗺️" color="gold"/>
        <StatsCard label="Total Meetings" value={meetings.length} icon="📅" color="blue"/>
        <StatsCard label="Region" value={constituency?.region ?? 'N/A'} icon="📍" color="green"/>
        <StatsCard label="Province" value={constituency?.province ?? 'N/A'} icon="🏙️" color="purple"/>
      </div>
      <div className="card mt-4">
        <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>📅 Recent Meetings</h2>
        {meetings.length===0?<p className="text-muted">No meetings scheduled</p>:meetings.map(m=>(
          <div key={m.id} style={{padding:'0.875rem',background:'var(--navy)',borderRadius:8,marginBottom:'0.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontWeight:600}}>{m.title}</div><div className="text-muted text-sm">{new Date(m.scheduledAt).toLocaleString()} {m.location?'• '+m.location:''}</div></div>
            <Badge status={m.status}/>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
