import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';

export default async function ChairmanDashboard() {
  const user = await getUser();
  if (!user || user.role!=='CHAIRMAN') redirect('/login');
  const [proposals, events, funds, news] = await Promise.all([
    prisma.proposal.count({ where:{status:'OPEN'} }),
    prisma.event.count(),
    prisma.fund.aggregate({ _sum:{amount:true}, where:{type:'DONATION'} }),
    prisma.news.count(),
  ]);
  return (
    <DashboardLayout title="Chairman Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">Chairman Overview</h1></div>
      <div className="stats-grid">
        <StatsCard label="Open Proposals" value={proposals} icon="🗳️" color="gold"/>
        <StatsCard label="Total Events" value={events} icon="🎪" color="blue"/>
        <StatsCard label="Total Donations" value={'৳'+((funds._sum.amount??0).toLocaleString())} icon="💰" color="green"/>
        <StatsCard label="News Articles" value={news} icon="📰" color="purple"/>
      </div>
    </DashboardLayout>
  );
}
