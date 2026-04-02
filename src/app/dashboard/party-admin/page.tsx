import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function PartyAdminDashboard() {
  const user = await getUser();
  if (!user || user.role !== 'PARTY_ADMIN') redirect('/login');

  const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!dbUser || !dbUser.partyName) redirect('/login');

  const [funds, members, events] = await Promise.all([
    prisma.fund.groupBy({ by: ['type'], where: { partyName: dbUser.partyName }, _sum: { amount: true } }),
    prisma.user.findMany({ where: { partyName: dbUser.partyName, role: 'MP' }, select: { name: true, email: true, constituency: { select: { name: true, nameBn: true, number: true } } } }),
    prisma.event.findMany({ where: { createdBy: { partyName: dbUser.partyName } }, take: 5, orderBy: { createdAt: 'desc' } })
  ]);

  const totalIn = funds.find(f => f.type === 'DONATION')?._sum.amount ?? 0;
  const totalOut = funds.find(f => f.type === 'EXPENSE')?._sum.amount ?? 0;

  return (
    <DashboardLayout title="Party Admin Dashboard" user={{ name: user.name, role: user.role, email: user.email }}>
      <div className="page-header">
        <h1 className="page-title">{dbUser.partyName} Dashboard</h1>
        <p className="page-subtitle">Manage your party's funds, MPs, and events — {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      <div className="grid-2" style={{ gap: '1.25rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>💰 Party Financial Summary</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Total Donations</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>৳{totalIn.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>Total Expenses</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>৳{totalOut.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Net Balance</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--gold)' }}>৳{(totalIn - totalOut).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>👥 Party MPs ({members.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {members.length === 0 ? <p className="text-muted">No MPs mapped to your party yet.</p> : members.map(m => (
              <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div className="text-muted text-sm">{m.email}</div>
                </div>
                {m.constituency ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 500, color: 'var(--gold)' }}>{m.constituency.nameBn}</div>
                    <div className="text-muted text-sm">{m.constituency.name}</div>
                  </div>
                ) : <span className="text-muted text-sm">No constituency assigned</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
