import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function MpDashboard() {
  const user = await getUser();
  if (!user || user.role !== 'MP') redirect('/login');

  const mpUser = await prisma.user.findUnique({ 
    where: { id: user.sub }, 
    include: { constituency: true } 
  });
  if (!mpUser) redirect('/login');

  const constituency = mpUser.constituency;
  const cId = constituency?.id;

  const [meetings, rumors, complaints, funds, events] = await Promise.all([
    prisma.meeting.findMany({ where: { mpId: mpUser.id }, orderBy: { scheduledAt: 'desc' }, take: 5 }),
    cId ? prisma.rumor.findMany({ where: { constituencyId: cId }, orderBy: { createdAt: 'desc' }, take: 5 }) : Promise.resolve([]),
    cId ? prisma.complaint.findMany({ where: { constituencyId: cId }, orderBy: { createdAt: 'desc' }, take: 5 }) : Promise.resolve([]),
    cId ? prisma.fund.findMany({ where: { constituencyId: cId }, orderBy: { createdAt: 'desc' }, take: 5 }) : Promise.resolve([]),
    cId ? prisma.event.findMany({ where: { constituencyId: cId, startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 3 }) : Promise.resolve([]),
  ]);

  return (
    <DashboardLayout title="MP Dashboard" user={{ name: user.name, role: user.role, email: user.email }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">MP Workspace</h1>
          <p className="page-subtitle">
            {mpUser.partyName ? <strong style={{ color: 'var(--gold)' }}>{mpUser.partyName}</strong> : ''}
            {mpUser.partyName && constituency ? ' • ' : ''}
            {constituency ? `${constituency.nameBn} (${constituency.name})` : 'No Constituency Assigned'}
          </p>
        </div>
        {mpUser.mpImageUrl ? (
          <img src={mpUser.mpImageUrl} alt={mpUser.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, border: '2px solid var(--border)' }}>
            {mpUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <StatsCard label="Region" value={constituency?.region ?? 'N/A'} icon="📍" color="green"/>
        <StatsCard label="Province" value={constituency?.province ?? 'N/A'} icon="🏙️" color="purple"/>
        <StatsCard label="Area Events" value={events.length} icon="🎪" color="gold"/>
        <StatsCard label="Area Complaints" value={complaints.length} icon="📢" color="red"/>
      </div>

      <div className="grid-2" style={{ gap: '1.25rem', marginTop: '1.25rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📅 My Meetings</h2>
          {meetings.length === 0 ? <p className="text-muted text-sm">No meetings scheduled</p> : meetings.map(m => (
            <div key={m.id} style={{ padding: '0.875rem', background: 'var(--navy)', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{m.title}</div>
                <div className="text-muted text-sm">{new Date(m.scheduledAt).toLocaleString()} {m.location ? '• ' + m.location : ''}</div>
              </div>
              <Badge status={m.status}/>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>📢 Recent Area Complaints</h2>
          {complaints.length === 0 ? <p className="text-muted text-sm">No complaints reported in your area</p> : complaints.map(c => (
             <div key={c.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                 <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.subject}</div>
                 <div className="text-muted text-xs">{new Date(c.createdAt).toLocaleDateString()}</div>
               </div>
               <Badge status={c.status} />
             </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>🔍 Area Rumors</h2>
          {rumors.length === 0 ? <p className="text-muted text-sm">No rumors reported</p> : rumors.map(r => (
             <div key={r.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                 <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                 <div className="text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</div>
               </div>
               <Badge status={r.status} />
             </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>💰 Area Funds</h2>
          {funds.length === 0 ? <p className="text-muted text-sm">No fund records</p> : funds.map(f => (
             <div key={f.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontWeight: 600, color: f.type === 'DONATION' ? '#10b981' : '#ef4444' }}>
                     {f.type === 'DONATION' ? '+' : '-'}৳{f.amount.toLocaleString()}
                  </div>
                  <div className="text-muted text-xs">{f.category}</div>
               </div>
               <div className="text-muted text-sm" style={{ textAlign: 'right' }}>
                  {new Date(f.createdAt).toLocaleDateString()}
               </div>
             </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
