'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem { href: string; label: string; icon: string; }
interface NavSection { section: string; items: NavItem[]; }

const navByRole: Record<string, NavSection[]> = {
  ADMIN: [
    { section: 'Overview', items: [{ href:'/dashboard/admin', label:'Dashboard', icon:'📊' }] },
    { section: 'Management', items: [
      { href:'/dashboard/constituencies', label:'Constituencies', icon:'🗺️' },
      { href:'/dashboard/proposals', label:'Proposals & Voting', icon:'🗳️' },
      { href:'/dashboard/meetings', label:'Meetings', icon:'📅' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
    ]},
    { section: 'Finance & Admin', items: [
      { href:'/dashboard/funds', label:'Fund Management', icon:'💰' },
      { href:'/dashboard/complaints', label:'Complaints', icon:'📢' },
      { href:'/dashboard/rumors', label:'Rumor Verification', icon:'🔍' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🌐' },
      { href:'/dashboard/users', label:'User Management', icon:'👥' },
    ]},
  ],
  CHAIRMAN: [
    { section: 'Overview', items: [{ href:'/dashboard/chairman', label:'Dashboard', icon:'👑' }] },
    { section: 'Operations', items: [
      { href:'/dashboard/constituencies', label:'Constituencies', icon:'🗺️' },
      { href:'/dashboard/proposals', label:'Proposals', icon:'🗳️' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/funds', label:'Funds', icon:'💰' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🌐' },
    ]},
  ],
  MINISTER: [
    { section: 'Overview', items: [{ href:'/dashboard/minister', label:'Dashboard', icon:'🏛️' }] },
    { section: 'My Work', items: [
      { href:'/dashboard/proposals', label:'Proposals & Voting', icon:'🗳️' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🌐' },
    ]},
  ],
  MP: [
    { section: 'Overview', items: [{ href:'/dashboard/mp', label:'Dashboard', icon:'🏢' }] },
    { section: 'My Work', items: [
      { href:'/dashboard/constituencies', label:'My Constituency', icon:'🗺️' },
      { href:'/dashboard/meetings', label:'My Meetings', icon:'📅' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🌐' },
    ]},
  ],
  PUBLIC: [
    { section: 'Public', items: [
      { href:'/dashboard/public', label:'Dashboard', icon:'🌐' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🗣️' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/complaints', label:'Submit Complaint', icon:'📢' },
      { href:'/dashboard/rumors', label:'Report Rumor', icon:'🔍' },
    ]},
  ],
};

export default function Sidebar({ user }: { user: { name: string; role: string; email: string } }) {
  const pathname = usePathname();
  const nav = navByRole[user.role] ?? navByRole.PUBLIC;
  const initials = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🦁</div>
        <div>
          <div className="sidebar-logo-text">National Party</div>
          <div className="sidebar-logo-sub">Management Platform</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link${pathname===item.href?' active':''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>
        </div>
        <button onClick={handleLogout} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'1rem'}} title="Logout">⬅</button>
      </div>
    </aside>
  );
}
