const fs = require('fs');
const path = require('path');
const root = __dirname;
function w(fp, c) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, c, 'utf8');
  console.log('✓ ' + fp);
}

// ── AUTH HELPER (server) ─────────────────────────────────────
w('src/lib/getUser.ts',
`import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import type { JWTPayload } from './auth';

export async function getUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ppp_auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch { return null; }
}
`);

// ── LOGIN PAGE ────────────────────────────────────────────────
w('src/app/login/page.tsx',
`'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_HOME: Record<string,string> = { ADMIN:'/dashboard/admin', CHAIRMAN:'/dashboard/chairman', MINISTER:'/dashboard/minister', MP:'/dashboard/mp', PUBLIC:'/dashboard/public' };
const DEMO = [
  { role:'Admin', email:'admin@party.gov', pass:'Admin@123' },
  { role:'Chairman', email:'chairman@party.gov', pass:'Chairman@123' },
  { role:'Minister', email:'minister@party.gov', pass:'Minister@123' },
  { role:'MP', email:'mp@party.gov', pass:'Mp@123456' },
  { role:'Public', email:'public@example.com', pass:'Public@123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(ROLE_HOME[data.data.role] ?? '/dashboard/public');
    } catch { setError('Network error. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-hero-icon">🦁</div>
        <h1 className="login-hero-title">National Party<br/>Management Platform</h1>
        <p className="login-hero-sub">Secure, transparent, and efficient management of party operations, constituencies, and public engagement.</p>
        <div className="login-features">
          {['300 Parliamentary Constituencies','Cabinet Voting System','MP Meeting Management','Fund Transparency','Complaint & Rumor Management'].map(f=>(
            <div key={f} className="login-feature"><div className="login-feature-dot"/><span>{f}</span></div>
          ))}
        </div>
      </div>
      <div className="login-right">
        <div className="login-form">
          <h2 className="login-form-title">Welcome Back</h2>
          <p className="login-form-sub">Sign in to access your dashboard</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@party.gov" required/>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
          </form>
          <div style={{marginTop:'2rem',padding:'1rem',background:'var(--card)',borderRadius:10,border:'1px solid var(--border)'}}>
            <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'0.75rem',fontWeight:600}}>DEMO ACCOUNTS</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
              {DEMO.map(d=>(
                <button key={d.role} onClick={()=>{setEmail(d.email);setPassword(d.pass);}}
                  style={{background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'0.4rem 0.75rem',color:'var(--silver)',cursor:'pointer',fontSize:'0.75rem',textAlign:'left',transition:'all 0.2s'}}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor='var(--gold)';(e.target as HTMLElement).style.color='var(--gold)';}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor='var(--border)';(e.target as HTMLElement).style.color='var(--silver)';}}>
                  <strong>{d.role}</strong> — {d.email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ── ADMIN DASHBOARD ───────────────────────────────────────────
w('src/app/dashboard/admin/page.tsx',
`import { redirect } from 'next/navigation';
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
`);

// ── CHAIRMAN DASHBOARD ────────────────────────────────────────
w('src/app/dashboard/chairman/page.tsx',
`import { redirect } from 'next/navigation';
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
`);

// ── MINISTER DASHBOARD ────────────────────────────────────────
w('src/app/dashboard/minister/page.tsx',
`import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';

export default async function MinisterDashboard() {
  const user = await getUser();
  if (!user || user.role!=='MINISTER') redirect('/login');
  const [myProposals, myVotes, openProposals] = await Promise.all([
    prisma.proposal.count({ where:{createdById:user.sub} }),
    prisma.vote.count({ where:{ministerId:user.sub} }),
    prisma.proposal.findMany({ where:{status:'OPEN'}, include:{createdBy:{select:{name:true}},votes:true}, orderBy:{createdAt:'desc'}, take:5 }),
  ]);
  return (
    <DashboardLayout title="Minister Dashboard" user={{name:user.name,role:user.role,email:user.email}}>
      <div className="page-header"><h1 className="page-title">Minister Workspace</h1></div>
      <div className="stats-grid">
        <StatsCard label="My Proposals" value={myProposals} icon="📋" color="gold"/>
        <StatsCard label="Votes Cast" value={myVotes} icon="🗳️" color="blue"/>
        <StatsCard label="Open for Voting" value={openProposals.length} icon="⏳" color="purple"/>
      </div>
      <div className="card mt-4">
        <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>🗳️ Open Proposals — Awaiting Your Vote</h2>
        {openProposals.length===0?<p className="text-muted">No open proposals</p>:openProposals.map(p=>{
          const hasVoted = p.votes.some(v=>v.ministerId===user.sub);
          return (
            <div key={p.id} style={{padding:'0.875rem',background:'var(--navy)',borderRadius:8,marginBottom:'0.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontWeight:600,marginBottom:'0.2rem'}}>{p.title}</div><div className="text-muted text-sm">by {p.createdBy.name} • {p.votes.length} votes</div></div>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                {hasVoted?<Badge status="RESOLVED"/>:<a href="/dashboard/proposals" className="btn btn-primary btn-sm">Vote Now</a>}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
`);

// ── MP DASHBOARD ──────────────────────────────────────────────
w('src/app/dashboard/mp/page.tsx',
`import { redirect } from 'next/navigation';
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
`);

// ── PUBLIC DASHBOARD ──────────────────────────────────────────
w('src/app/dashboard/public/page.tsx',
`import { redirect } from 'next/navigation';
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
`);

console.log('\n✅ Auth + Dashboards done!');
