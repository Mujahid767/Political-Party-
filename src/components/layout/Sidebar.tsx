'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem { href: string; label: string; icon: string; }
interface NavSection { section: string; items: NavItem[]; }

const navByRole: Record<string, NavSection[]> = {
  ADMIN: [
    { section: 'Overview', items: [{ href:'/dashboard/admin', label:'Dashboard', icon:'📊' }] },
    { section: 'Management', items: [
      { href:'/dashboard/admin/parties', label:'Parties & Alliances', icon:'🏛️' },
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
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
    ]},
  ],
  PARTY_ADMIN: [
    { section: 'Overview', items: [{ href:'/dashboard/party-admin', label:'Party Dashboard', icon:'📊' }] },
    { section: 'Operations', items: [
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🌐' },
    ]},
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
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
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
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
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
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
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
    ]},
  ],
  PUBLIC: [
    { section: 'Public', items: [
      { href:'/dashboard/public', label:'Dashboard', icon:'🌐' },
      { href:'/dashboard/community', label:'Community Feed', icon:'🗣️' },
      { href:'/dashboard/news', label:'Official Newsfeed', icon:'📰' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/donate', label:'Donate to Party', icon:'💚' },
      { href:'/dashboard/complaints', label:'Submit Complaint', icon:'📢' },
      { href:'/dashboard/rumors', label:'Report Rumor', icon:'❓' },
    ]},
    { section: 'People', items: [
      { href:'/dashboard/search', label:'Search Users', icon:'🔍' },
    ]},
  ],
};

export default function Sidebar({ user }: { user: { name: string; role: string; email: string } }) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const nav = navByRole[user.role] ?? navByRole.PUBLIC;
  const initials = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.data?.id) setUserId(d.data.id);
    });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' });
    window.location.href = '/login';
  }

  const profileHref = userId ? `/dashboard/profile/${userId}` : '#';

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
        {/* My Profile — always first */}
        <div className="nav-section">
          <div className="nav-section-label">My Account</div>
          <Link href={profileHref} className={`nav-link${pathname.startsWith('/dashboard/profile') ? ' active' : ''}`}>
            <span>👤</span><span>My Profile</span>
          </Link>
        </div>

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
