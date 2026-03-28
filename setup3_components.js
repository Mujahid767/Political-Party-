const fs = require('fs');
const path = require('path');
const root = __dirname;
function w(fp, c) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, c, 'utf8');
  console.log('✓ ' + fp);
}

// ── GLOBALS CSS ───────────────────────────────────────────────
w('src/app/globals.css',
`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import "tailwindcss";

:root {
  --navy: #0a1628;
  --navy-light: #112240;
  --navy-mid: #1a3a5c;
  --gold: #f59e0b;
  --gold-light: #fcd34d;
  --gold-dark: #d97706;
  --silver: #94a3b8;
  --bg: #06101f;
  --card: #0d1f38;
  --border: #1e3a5f;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--navy); }
::-webkit-scrollbar-thumb { background: var(--navy-mid); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold-dark); }

/* ── Layout ── */
.dashboard-layout { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: var(--navy); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; overflow-y: auto; z-index: 50; transition: transform 0.3s ease; }
.main-content { margin-left: 260px; flex: 1; min-height: 100vh; background: var(--bg); }
.topbar { background: var(--card); border-bottom: 1px solid var(--border); padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }
.page-content { padding: 1.5rem; }

/* ── Sidebar ── */
.sidebar-logo { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; }
.sidebar-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.sidebar-logo-text { font-size: 0.9rem; font-weight: 700; color: var(--text); line-height: 1.2; }
.sidebar-logo-sub { font-size: 0.7rem; color: var(--silver); }
.sidebar-nav { flex: 1; padding: 1rem 0; }
.nav-section { margin-bottom: 0.5rem; }
.nav-section-label { padding: 0.25rem 1.25rem; font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1.25rem; color: var(--silver); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; border-right: 3px solid transparent; }
.nav-link:hover { background: rgba(245,158,11,0.08); color: var(--gold); border-right-color: transparent; }
.nav-link.active { background: rgba(245,158,11,0.12); color: var(--gold); border-right-color: var(--gold); }
.nav-link-icon { width: 18px; height: 18px; flex-shrink: 0; opacity: 0.8; }
.sidebar-user { padding: 1rem 1.25rem; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; color: var(--navy); flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 0.8rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: var(--gold); }

/* ── Cards ── */
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.stat-card.gold::before { background: linear-gradient(90deg, var(--gold), var(--gold-light)); }
.stat-card.blue::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.stat-card.green::before { background: linear-gradient(90deg, #10b981, #34d399); }
.stat-card.red::before { background: linear-gradient(90deg, #ef4444, #f87171); }
.stat-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.stat-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #67e8f9); }
.stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text); line-height: 1; }
.stat-icon { position: absolute; top: 1rem; right: 1rem; opacity: 0.15; font-size: 2.5rem; }
.stat-change { font-size: 0.7rem; margin-top: 0.4rem; color: var(--success); }

/* ── Tables ── */
.table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.table-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.table-title { font-size: 1rem; font-weight: 600; }
table { width: 100%; border-collapse: collapse; }
thead th { background: var(--navy); padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
tbody tr { border-top: 1px solid var(--border); transition: background 0.15s; }
tbody tr:hover { background: rgba(245,158,11,0.04); }
tbody td { padding: 0.875rem 1rem; font-size: 0.875rem; color: var(--text); }

/* ── Badges ── */
.badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-gold { background: rgba(245,158,11,0.15); color: var(--gold); }
.badge-green { background: rgba(16,185,129,0.15); color: #10b981; }
.badge-red { background: rgba(239,68,68,0.15); color: #ef4444; }
.badge-blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
.badge-purple { background: rgba(139,92,246,0.15); color: #8b5cf6; }
.badge-gray { background: rgba(100,116,139,0.15); color: #94a3b8; }
.badge-cyan { background: rgba(6,182,212,0.15); color: #06b6d4; }

/* ── Buttons ── */
.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
.btn-primary { background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--navy); font-weight: 600; }
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-secondary { background: var(--navy-light); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
.btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

/* ── Forms ── */
.form-group { margin-bottom: 1rem; }
label { display: block; font-size: 0.8rem; font-weight: 500; color: var(--silver); margin-bottom: 0.4rem; }
input, select, textarea { width: 100%; background: var(--navy); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.875rem; color: var(--text); font-size: 0.875rem; font-family: inherit; transition: border-color 0.2s; outline: none; }
input:focus, select:focus, textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
input::placeholder, textarea::placeholder { color: var(--text-muted); }
select option { background: var(--navy); }

/* ── Page header ── */
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; }

/* ── Grid helpers ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.flex { display: flex; }
.flex-center { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.text-muted { color: var(--text-muted); font-size: 0.875rem; }
.text-gold { color: var(--gold); }
.text-sm { font-size: 0.8rem; }
.fw-600 { font-weight: 600; }
.w-full { width: 100%; }

/* ── Search ── */
.search-bar { position: relative; }
.search-bar input { padding-left: 2.25rem; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 16px; height: 16px; pointer-events: none; }

/* ── Vote bars ── */
.vote-bar { height: 8px; border-radius: 4px; overflow: hidden; background: var(--navy); display: flex; margin: 0.5rem 0; }
.vote-bar-yes { background: var(--success); transition: width 0.5s ease; }
.vote-bar-no { background: var(--danger); transition: width 0.5s ease; }
.vote-bar-abstain { background: var(--silver); transition: width 0.5s ease; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
.empty-state-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; }

/* ── Login page ── */
.login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
.login-left { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; }
.login-right { background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 3rem; }
.login-form { width: 100%; max-width: 400px; }
.login-hero-icon { width: 80px; height: 80px; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 2rem; }
.login-hero-title { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.75rem; line-height: 1.2; }
.login-hero-sub { color: var(--silver); font-size: 1rem; line-height: 1.6; }
.login-features { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.login-feature { display: flex; align-items: center; gap: 0.75rem; color: var(--silver); font-size: 0.875rem; }
.login-feature-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
.login-form-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.login-form-sub { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 2rem; }
.login-btn { width: 100%; padding: 0.875rem; font-size: 0.95rem; font-weight: 600; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--navy); cursor: pointer; transition: all 0.2s; }
.login-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.login-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.875rem; margin-bottom: 1rem; }

@media (max-width: 768px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .sidebar { transform: translateX(-100%); }
  .main-content { margin-left: 0; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

/* ── Animations ── */
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
.animate-fade-in { animation: fadeIn 0.35s ease; }
.skeleton { animation: pulse 1.5s infinite; background: var(--navy-light); border-radius: 6px; }
`);

// ── ROOT LAYOUT ───────────────────────────────────────────────
w('src/app/layout.tsx',
`import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'National Party Platform',
  description: 'Internal political party management system — constituencies, voting, meetings, events, and public engagement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`);

// ── ROOT PAGE (redirect) ──────────────────────────────────────
w('src/app/page.tsx',
`import { redirect } from 'next/navigation';
export default function Home() { redirect('/login'); }
`);

// ── SIDEBAR COMPONENT ─────────────────────────────────────────
w('src/components/layout/Sidebar.tsx',
`'use client';
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
      { href:'/dashboard/news', label:'Newsfeed', icon:'📰' },
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
      { href:'/dashboard/news', label:'Newsfeed', icon:'📰' },
    ]},
  ],
  MINISTER: [
    { section: 'Overview', items: [{ href:'/dashboard/minister', label:'Dashboard', icon:'🏛️' }] },
    { section: 'My Work', items: [
      { href:'/dashboard/proposals', label:'Proposals & Voting', icon:'🗳️' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/news', label:'Newsfeed', icon:'📰' },
    ]},
  ],
  MP: [
    { section: 'Overview', items: [{ href:'/dashboard/mp', label:'Dashboard', icon:'🏢' }] },
    { section: 'My Work', items: [
      { href:'/dashboard/constituencies', label:'My Constituency', icon:'🗺️' },
      { href:'/dashboard/meetings', label:'My Meetings', icon:'📅' },
      { href:'/dashboard/events', label:'Events', icon:'🎪' },
      { href:'/dashboard/news', label:'Newsfeed', icon:'📰' },
    ]},
  ],
  PUBLIC: [
    { section: 'Public', items: [
      { href:'/dashboard/public', label:'Dashboard', icon:'🌐' },
      { href:'/dashboard/news', label:'Newsfeed', icon:'📰' },
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
              <Link key={item.href} href={item.href} className={\`nav-link\${pathname===item.href?' active':''}\`}>
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
`);

// ── TOPBAR ────────────────────────────────────────────────────
w('src/components/layout/TopBar.tsx',
`'use client';
export default function TopBar({ title, user }: { title: string; user: { name: string; role: string } }) {
  return (
    <div className="topbar">
      <div>
        <h1 style={{fontSize:'1.1rem',fontWeight:700}}>{title}</h1>
        <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Welcome back, {user.name}</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <span className="badge badge-gold">{user.role}</span>
        <div style={{width:1,height:24,background:'var(--border)'}}/>
        <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
        </span>
      </div>
    </div>
  );
}
`);

// ── DASHBOARD LAYOUT ──────────────────────────────────────────
w('src/components/layout/DashboardLayout.tsx',
`import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props {
  children: React.ReactNode;
  title: string;
  user: { name: string; role: string; email: string };
}

export default function DashboardLayout({ children, title, user }: Props) {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="main-content">
        <TopBar title={title} user={user} />
        <div className="page-content animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
`);

// ── STATS CARD ────────────────────────────────────────────────
w('src/components/ui/StatsCard.tsx',
`interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: 'gold'|'blue'|'green'|'red'|'purple'|'cyan';
  change?: string;
}
export default function StatsCard({ label, value, icon, color='gold', change }: Props) {
  return (
    <div className={\`stat-card \${color}\`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{typeof value==='number'?value.toLocaleString():value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}
`);

// ── BADGE ─────────────────────────────────────────────────────
w('src/components/ui/Badge.tsx',
`const map: Record<string,string> = {
  OPEN:'gold', PASSED:'green', REJECTED:'red', CLOSED:'gray',
  PENDING:'gold', UNDER_REVIEW:'blue', RESOLVED:'green',
  REPORTED:'red', VERIFIED_TRUE:'purple', VERIFIED_FALSE:'gray', PUBLISHED:'green',
  DONATION:'green', EXPENSE:'red',
  SCHEDULED:'blue', COMPLETED:'green', CANCELLED:'gray',
  ADMIN:'purple', CHAIRMAN:'gold', MINISTER:'blue', MP:'cyan', PUBLIC:'gray',
};
export default function Badge({ status }: { status: string }) {
  const color = map[status] ?? 'gray';
  return <span className={\`badge badge-\${color}\`}>{status.replace(/_/g,' ')}</span>;
}
`);

// ── MODAL ─────────────────────────────────────────────────────
w('src/components/ui/Modal.tsx',
`'use client';
interface Props { title: string; onClose: ()=>void; children: React.ReactNode; }
export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal animate-fade-in">
        <div className="flex-between mb-4">
          <h2 className="modal-title" style={{margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'1.25rem'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
`);

// ── VOTE CHART ────────────────────────────────────────────────
w('src/components/charts/VoteChart.tsx',
`'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
interface Props { yes: number; no: number; abstain: number; }
export default function VoteChart({ yes, no, abstain }: Props) {
  const data = [
    { name:'Yes', value:yes, color:'#10b981' },
    { name:'No', value:no, color:'#ef4444' },
    { name:'Abstain', value:abstain, color:'#94a3b8' },
  ].filter(d=>d.value>0);
  if (data.length===0) return <p className="text-muted" style={{textAlign:'center',padding:'2rem'}}>No votes yet</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
          {data.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
        </Pie>
        <Tooltip contentStyle={{background:'#0d1f38',border:'1px solid #1e3a5f',borderRadius:8,color:'#e2e8f0'}}/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
`);

// ── FUND CHART ────────────────────────────────────────────────
w('src/components/charts/FundChart.tsx',
`'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
interface Props { data: { category: string; amount: number; type: string }[] }
export default function FundChart({ data }: Props) {
  const grouped: Record<string,{category:string;income:number;expense:number}> = {};
  data.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = { category: d.category, income:0, expense:0 };
    if (d.type==='DONATION') grouped[d.category].income += d.amount;
    else grouped[d.category].expense += d.amount;
  });
  const chartData = Object.values(grouped);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f"/>
        <XAxis dataKey="category" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000)+'k':v}/>
        <Tooltip contentStyle={{background:'#0d1f38',border:'1px solid #1e3a5f',borderRadius:8,color:'#e2e8f0'}}/>
        <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Donations"/>
        <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expenses"/>
      </BarChart>
    </ResponsiveContainer>
  );
}
`);

console.log('\n✅ Components done!');
