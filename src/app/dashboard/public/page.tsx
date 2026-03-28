import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';

export default async function PublicDashboard() {
  const user = await getUser();
  if (!user) redirect('/login');
  const [news, events, myComplaints] = await Promise.all([
    prisma.news.count(),
    prisma.event.count(),
    prisma.complaint.count({ where:{submittedById:user.sub} }),
  ]);
  return (
    <DashboardLayout title="Public Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">Welcome, {user.name}</h1><p className="page-subtitle">Stay informed and engaged with your party</p></div>
      <div className="stats-grid">
        <StatsCard label="News Articles" value={news} icon="📰" color="gold"/>
        <StatsCard label="Upcoming Events" value={events} icon="🎪" color="blue"/>
        <StatsCard label="My Complaints" value={myComplaints} icon="📢" color="red"/>
      </div>
    </DashboardLayout>
  );
}
