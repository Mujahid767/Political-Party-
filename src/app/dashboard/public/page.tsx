import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';

export default async function PublicDashboard() {
  const user = await getUser();
  if (!user) redirect('/login');

  const [news, events, myComplaints, myPosts, myEventCount, myDonationTotal] = await Promise.all([
    prisma.news.count(),
    prisma.event.count(),
    prisma.complaint.count({ where:{submittedById:user.sub} }),
    prisma.post.count({ where:{authorId:user.sub} }),
    prisma.eventParticipant.count({ where:{userId:user.sub} }),
    prisma.donation.aggregate({ where:{donorId:user.sub, status:'SUCCESS'}, _sum:{amount:true} }),
  ]);

  const totalDonated = myDonationTotal._sum.amount ?? 0;

  return (
    <DashboardLayout title="Public Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">Welcome, {user.name}</h1><p className="page-subtitle">Stay informed and engaged with your party</p></div>

      {/* Platform Stats */}
      <div className="stats-grid" style={{marginBottom:'1.5rem'}}>
        <StatsCard label="News Articles" value={news} icon="📰" color="gold"/>
        <StatsCard label="Upcoming Events" value={events} icon="🎪" color="blue"/>
        <StatsCard label="My Complaints" value={myComplaints} icon="📢" color="red"/>
      </div>

      {/* My Activity */}
      <h2 style={{fontWeight:700,fontSize:'1rem',marginBottom:'0.875rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>My Activity</h2>
      <div className="stats-grid" style={{marginBottom:'2rem'}}>
        <StatsCard label="My Posts" value={myPosts} icon="📝" color="gold"/>
        <StatsCard label="Events Attended" value={myEventCount} icon="🎪" color="blue"/>
        <StatsCard label="Total Donated (BDT)" value={`৳${totalDonated.toLocaleString()}`} icon="💚" color="green"/>
      </div>

      {/* Quick Actions */}
      <h2 style={{fontWeight:700,fontSize:'1rem',marginBottom:'0.875rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Quick Actions</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'0.875rem'}}>
        {[
          { href:`/dashboard/profile/${user.sub}`, icon:'👤', label:'My Profile', desc:'View your public profile' },
          { href:'/dashboard/donate', icon:'💚', label:'Donate to Party', desc:'Support via bKash' },
          { href:'/dashboard/search', icon:'🔍', label:'Search Users', desc:'Find party members' },
          { href:'/dashboard/community', icon:'🌐', label:'Community Feed', desc:'Post & connect' },
          { href:'/dashboard/events', icon:'🎪', label:'Browse Events', desc:'Register & attend' },
          { href:'/dashboard/complaints', icon:'📢', label:'File Complaint', desc:'Report an issue' },
        ].map(a=>(
          <Link key={a.href} href={a.href} className="quick-action-card">
            <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>{a.icon}</div>
            <div style={{fontWeight:600,fontSize:'0.875rem',marginBottom:'0.2rem'}}>{a.label}</div>
            <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
