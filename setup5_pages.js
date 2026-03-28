const fs = require('fs');
const path = require('path');
const root = __dirname;
function w(fp, c) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, c, 'utf8');
  console.log('✓ ' + fp);
}

// ── CONSTITUENCIES PAGE ───────────────────────────────────────
w('src/app/dashboard/constituencies/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';

interface Constituency { id:string; number:number; name:string; region:string; province:string; mp?:{name:string;email:string}|null; }
interface UserInfo { name:string; role:string; email:string; }

export default function ConstituenciesPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [data, setData] = useState<Constituency[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(true);

  const PROVINCES = ['Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh'];

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);

  useEffect(()=>{
    setLoading(true);
    const p = new URLSearchParams({ page:String(page), limit:'15', ...(search?{search}:{}), ...(province?{province}:{}) });
    fetch('/api/constituencies?'+p).then(r=>r.json()).then(d=>{ setData(d.data||[]); setTotal(d.total||0); }).finally(()=>setLoading(false));
  },[page,search,province]);

  if (!user) return null;
  const pages = Math.ceil(total/15);

  return (
    <DashboardLayout title="Constituencies" user={user}>
      <div className="page-header">
        <h1 className="page-title">Parliamentary Constituencies</h1>
        <p className="page-subtitle">Manage all 300 parliamentary seats and MP assignments</p>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="search-bar" style={{flex:1,maxWidth:320}}>
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name or number..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{paddingLeft:'2rem'}}/>
          </div>
          <select value={province} onChange={e=>{setProvince(e.target.value);setPage(1);}} style={{width:'auto'}}>
            <option value="">All Provinces</option>
            {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-muted text-sm">{total} total</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr><th>#</th><th>Constituency</th><th>Province</th><th>Region</th><th>MP Assigned</th></tr></thead>
            <tbody>
              {loading?<tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>Loading...</td></tr>
              :data.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No constituencies found</td></tr>
              :data.map(c=>(
                <tr key={c.id}>
                  <td><span style={{fontWeight:700,color:'var(--gold)'}}>{c.number}</span></td>
                  <td style={{fontWeight:500}}>{c.name}</td>
                  <td>{c.province}</td>
                  <td><span className="badge badge-blue">{c.region}</span></td>
                  <td>{c.mp?<span style={{color:'var(--success)'}}>{c.mp.name}</span>:<span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages>1&&<div style={{padding:'1rem',display:'flex',justifyContent:'center',gap:'0.5rem'}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Prev</button>
          <span style={{padding:'0.35rem 0.75rem',fontSize:'0.8rem',color:'var(--text-muted)'}}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}>Next →</button>
        </div>}
      </div>
    </DashboardLayout>
  );
}
`);

// ── PROPOSALS PAGE ────────────────────────────────────────────
w('src/app/dashboard/proposals/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import VoteChart from '@/components/charts/VoteChart';

interface Proposal { id:string; title:string; description:string; status:string; createdBy:{name:string}; votes:{choice:string;ministerId:string}[]; createdAt:string; }
interface UserInfo { id:string; name:string; role:string; email:string; }

export default function ProposalsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/proposals').then(r=>r.json()).then(d=>setProposals(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function createProposal(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/proposals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description:desc})});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setTitle('');setDesc('');load(); } else setMsg(d.error);
  }

  async function vote(proposalId:string, choice:string) {
    const res = await fetch('/api/votes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({proposalId,choice})});
    const d = await res.json();
    if (d.success) { load(); setSelected(null); } else setMsg(d.error);
  }

  async function closeProposal(id:string) {
    await fetch(\`/api/proposals/\${id}\`,{method:'PATCH'});
    load();
  }

  if (!user) return null;
  const canCreate = ['MINISTER','ADMIN','CHAIRMAN'].includes(user.role);
  const canVote = user.role==='MINISTER';
  const canClose = ['ADMIN','CHAIRMAN'].includes(user.role);

  return (
    <DashboardLayout title="Proposals & Voting" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Cabinet Proposals & Voting</h1><p className="page-subtitle">Secure one-vote-per-minister voting system</p></div>
        {canCreate&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ New Proposal</button>}
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}<button onClick={()=>setMsg('')} style={{float:'right',background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {proposals.length===0?<div className="empty-state"><div className="empty-state-icon">🗳️</div><p>No proposals yet</p></div>
        :proposals.map(p=>{
          const yes=p.votes.filter(v=>v.choice==='YES').length;
          const no=p.votes.filter(v=>v.choice==='NO').length;
          const abstain=p.votes.filter(v=>v.choice==='ABSTAIN').length;
          const total=p.votes.length;
          const hasVoted=canVote&&p.votes.some(v=>v.ministerId===user.id);
          return (
            <div key={p.id} className="card" style={{transition:'transform 0.2s'}} onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>(e.currentTarget.style.transform='')}>
              <div className="flex-between" style={{marginBottom:'0.75rem'}}>
                <h3 style={{fontSize:'1rem',fontWeight:600}}>{p.title}</h3>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <Badge status={p.status}/>
                  {canClose&&p.status==='OPEN'&&<button className="btn btn-secondary btn-sm" onClick={()=>closeProposal(p.id)}>Close</button>}
                </div>
              </div>
              <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'0.875rem'}}>{p.description}</p>
              <div style={{display:'flex',gap:'1rem',marginBottom:'0.75rem',fontSize:'0.8rem'}}>
                <span style={{color:'#10b981'}}>✅ Yes: {yes}</span>
                <span style={{color:'#ef4444'}}>❌ No: {no}</span>
                <span style={{color:'var(--silver)'}}>⚪ Abstain: {abstain}</span>
                <span style={{color:'var(--text-muted)'}}>Total: {total}</span>
              </div>
              {total>0&&<div className="vote-bar" style={{marginBottom:'0.75rem'}}>
                <div className="vote-bar-yes" style={{width:(yes/total*100)+'%'}}/>
                <div className="vote-bar-no" style={{width:(no/total*100)+'%'}}/>
                <div className="vote-bar-abstain" style={{width:(abstain/total*100)+'%'}}/>
              </div>}
              <div className="flex-between">
                <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>by {p.createdBy.name} • {new Date(p.createdAt).toLocaleDateString()}</span>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setSelected(p)}>View Chart</button>
                  {canVote&&p.status==='OPEN'&&!hasVoted&&<><button className="btn btn-primary btn-sm" onClick={()=>vote(p.id,'YES')}>✅ Yes</button><button className="btn btn-danger btn-sm" onClick={()=>vote(p.id,'NO')}>❌ No</button><button className="btn btn-secondary btn-sm" onClick={()=>vote(p.id,'ABSTAIN')}>⚪ Abstain</button></>}
                  {hasVoted&&<span className="badge badge-green">Voted</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selected&&<Modal title={selected.title} onClose={()=>setSelected(null)}>
        <VoteChart yes={selected.votes.filter(v=>v.choice==='YES').length} no={selected.votes.filter(v=>v.choice==='NO').length} abstain={selected.votes.filter(v=>v.choice==='ABSTAIN').length}/>
        <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:'0.8rem',marginTop:'0.5rem'}}>{selected.votes.length} total votes cast</p>
      </Modal>}
      {showCreate&&<Modal title="Create New Proposal" onClose={()=>setShowCreate(false)}>
        <form onSubmit={createProposal}>
          <div className="form-group"><label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} required/></div>
          <div className="form-group"><label>Description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} required/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Proposal</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── MEETINGS PAGE ─────────────────────────────────────────────
w('src/app/dashboard/meetings/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Meeting { id:string; title:string; agenda:string; scheduledAt:string; location:string|null; status:string; mp:{name:string}; }
interface UserInfo { name:string; role:string; email:string; }

export default function MeetingsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', agenda:'', scheduledAt:'', location:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/meetings').then(r=>r.json()).then(d=>setMeetings(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/meetings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false); setForm({title:'',agenda:'',scheduledAt:'',location:''}); load(); } else setMsg(d.error);
  }

  if (!user) return null;
  const canCreate = user.role==='MP'||user.role==='ADMIN';

  return (
    <DashboardLayout title="Meetings" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">MP Meeting Management</h1><p className="page-subtitle">Schedule and track constituency meetings</p></div>
        {canCreate&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Schedule Meeting</button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Meeting</th><th>Scheduled At</th><th>Location</th><th>MP</th><th>Status</th></tr></thead>
          <tbody>
            {meetings.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No meetings found</td></tr>
            :meetings.map(m=>(
              <tr key={m.id}>
                <td><div style={{fontWeight:600}}>{m.title}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.2rem'}}>{m.agenda.substring(0,60)}...</div></td>
                <td>{new Date(m.scheduledAt).toLocaleString()}</td>
                <td>{m.location||'—'}</td>
                <td>{m.mp.name}</td>
                <td><Badge status={m.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate&&<Modal title="Schedule Meeting" onClose={()=>setShowCreate(false)}>
        <form onSubmit={create}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
          <div className="form-group"><label>Agenda</label><textarea value={form.agenda} onChange={e=>setForm(f=>({...f,agenda:e.target.value}))} rows={3} required/></div>
          <div className="form-group"><label>Date & Time</label><input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))} required/></div>
          <div className="form-group"><label>Location (optional)</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── EVENTS PAGE ───────────────────────────────────────────────
w('src/app/dashboard/events/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';

interface Event { id:string; title:string; description:string; location:string; startDate:string; endDate:string; createdBy:{name:string}; _count:{participants:number}; }
interface UserInfo { name:string; role:string; email:string; }

export default function EventsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showRegister, setShowRegister] = useState<string|null>(null);
  const [form, setForm] = useState({ title:'', description:'', location:'', startDate:'', endDate:'' });
  const [reg, setReg] = useState({ name:'', email:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/events').then(r=>r.json()).then(d=>setEvents(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({title:'',description:'',location:'',startDate:'',endDate:''});load(); } else setMsg(d.error);
  }

  async function register(e:React.FormEvent) {
    e.preventDefault();
    if (!showRegister) return;
    const res = await fetch(\`/api/events/\${showRegister}/register\`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reg)});
    const d = await res.json();
    if (d.success) { setShowRegister(null);setReg({name:'',email:''});load(); } else setMsg(d.error);
  }

  if (!user) return null;
  const canCreate = ['ADMIN','CHAIRMAN'].includes(user.role);

  return (
    <DashboardLayout title="Events" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Event Management</h1><p className="page-subtitle">Party events, rallies, and gatherings</p></div>
        {canCreate&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Create Event</button>}
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}<button onClick={()=>setMsg('')} style={{float:'right',background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}
      <div className="grid-2" style={{gap:'1rem'}}>
        {events.length===0?<div className="empty-state" style={{gridColumn:'1/-1'}}><div className="empty-state-icon">🎪</div><p>No events yet</p></div>
        :events.map(ev=>(
          <div key={ev.id} className="card" style={{transition:'transform 0.2s'}} onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>(e.currentTarget.style.transform='')}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.75rem'}}>
              <h3 style={{fontWeight:600,fontSize:'1rem'}}>{ev.title}</h3>
              <span className="badge badge-blue">{ev._count.participants} registered</span>
            </div>
            <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'0.75rem'}}>{ev.description}</p>
            <div style={{fontSize:'0.8rem',color:'var(--silver)',display:'flex',flexDirection:'column',gap:'0.3rem',marginBottom:'0.875rem'}}>
              <span>📍 {ev.location}</span>
              <span>📅 {new Date(ev.startDate).toLocaleString()} — {new Date(ev.endDate).toLocaleString()}</span>
              <span>👤 by {ev.createdBy.name}</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowRegister(ev.id)}>Register Participant</button>
          </div>
        ))}
      </div>
      {showCreate&&<Modal title="Create Event" onClose={()=>setShowCreate(false)}>
        <form onSubmit={create}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} required/></div>
          <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} required/></div>
          <div className="grid-2"><div className="form-group"><label>Start Date</label><input type="datetime-local" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} required/></div>
          <div className="form-group"><label>End Date</label><input type="datetime-local" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} required/></div></div>
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>}
      {showRegister&&<Modal title="Register Participant" onClose={()=>setShowRegister(null)}>
        <form onSubmit={register}>
          <div className="form-group"><label>Full Name</label><input value={reg.name} onChange={e=>setReg(r=>({...r,name:e.target.value}))} required/></div>
          <div className="form-group"><label>Email</label><input type="email" value={reg.email} onChange={e=>setReg(r=>({...r,email:e.target.value}))} required/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowRegister(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── FUNDS PAGE ────────────────────────────────────────────────
w('src/app/dashboard/funds/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/ui/StatsCard';
import FundChart from '@/components/charts/FundChart';

interface Fund { id:string; type:string; amount:number; description:string; category:string; recordedBy:{name:string}; createdAt:string; }
interface Summary { totalIn:number; totalOut:number; balance:number; }
interface UserInfo { name:string; role:string; email:string; }

export default function FundsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [summary, setSummary] = useState<Summary>({totalIn:0,totalOut:0,balance:0});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type:'DONATION', amount:'', description:'', category:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>{
    fetch('/api/funds').then(r=>r.json()).then(d=>setFunds(d.data||[]));
    fetch('/api/funds?summary=true').then(r=>r.json()).then(d=>setSummary(d.data||{totalIn:0,totalOut:0,balance:0}));
  };
  useEffect(()=>{ load(); },[]);

  async function create(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/funds',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,amount:parseFloat(form.amount)})});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({type:'DONATION',amount:'',description:'',category:''});load(); } else setMsg(d.error);
  }

  if (!user) return null;
  const canCreate = ['ADMIN','CHAIRMAN'].includes(user.role);
  const chartData = funds.map(f=>({ category:f.category, amount:f.amount, type:f.type }));

  return (
    <DashboardLayout title="Fund Management" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Fund Management</h1><p className="page-subtitle">Financial transparency — all donations and expenses</p></div>
        {canCreate&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Record Transaction</button>}
      </div>
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <StatsCard label="Total Donations" value={'৳'+summary.totalIn.toLocaleString()} icon="💵" color="green"/>
        <StatsCard label="Total Expenses" value={'৳'+summary.totalOut.toLocaleString()} icon="📤" color="red"/>
        <StatsCard label="Net Balance" value={'৳'+summary.balance.toLocaleString()} icon="💰" color="gold"/>
      </div>
      {funds.length>0&&<div className="card" style={{marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1rem',fontWeight:600,marginBottom:'1rem'}}>📊 Fund Distribution by Category</h2>
        <FundChart data={chartData}/>
      </div>}
      <div className="table-wrap">
        <div className="table-header"><h2 style={{fontSize:'1rem',fontWeight:600}}>All Transactions</h2></div>
        <table>
          <thead><tr><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Recorded By</th><th>Date</th></tr></thead>
          <tbody>
            {funds.length===0?<tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No transactions recorded</td></tr>
            :funds.map(f=>(
              <tr key={f.id}>
                <td><Badge status={f.type}/></td>
                <td>{f.description}</td>
                <td><span className="badge badge-gray">{f.category}</span></td>
                <td><span style={{fontWeight:700,color:f.type==='DONATION'?'#10b981':'#ef4444'}}>৳{f.amount.toLocaleString()}</span></td>
                <td>{f.recordedBy.name}</td>
                <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{new Date(f.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate&&<Modal title="Record Transaction" onClose={()=>setShowCreate(false)}>
        <form onSubmit={create}>
          <div className="form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="DONATION">Donation</option><option value="EXPENSE">Expense</option></select></div>
          <div className="form-group"><label>Amount (৳)</label><input type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required/></div>
          <div className="form-group"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required/></div>
          <div className="form-group"><label>Category</label><input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="e.g. Campaign, Operations" required/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── COMPLAINTS PAGE ───────────────────────────────────────────
w('src/app/dashboard/complaints/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Complaint { id:string; subject:string; description:string; status:string; submittedBy:{name:string;email:string}; adminNote:string|null; createdAt:string; }
interface UserInfo { name:string; role:string; email:string; }

export default function ComplaintsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject:'', description:'' });
  const [review, setReview] = useState({ status:'RESOLVED', adminNote:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/complaints').then(r=>r.json()).then(d=>setComplaints(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/complaints',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({subject:'',description:''});load(); } else setMsg(d.error);
  }

  async function updateStatus(id:string) {
    const res = await fetch(\`/api/complaints/\${id}\`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(review)});
    const d = await res.json();
    if (d.success) { setSelected(null);load(); } else setMsg(d.error);
  }

  if (!user) return null;
  const isAdmin = ['ADMIN','CHAIRMAN'].includes(user.role);

  return (
    <DashboardLayout title="Complaints" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Complaint Management</h1><p className="page-subtitle">{isAdmin?'Review and resolve public complaints':'Submit and track your complaints'}</p></div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Submit Complaint</button>
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}<button onClick={()=>setMsg('')} style={{float:'right',background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Subject</th><th>Submitted By</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {complaints.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No complaints found</td></tr>
            :complaints.map(c=>(
              <tr key={c.id}>
                <td><div style={{fontWeight:600}}>{c.subject}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.2rem'}}>{c.description.substring(0,60)}...</div></td>
                <td>{c.submittedBy.name}</td>
                <td><Badge status={c.status}/></td>
                <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>{isAdmin&&c.status==='PENDING'&&<button className="btn btn-primary btn-sm" onClick={()=>{setSelected(c);setReview({status:'RESOLVED',adminNote:''});}}>Review</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate&&<Modal title="Submit Complaint" onClose={()=>setShowCreate(false)}>
        <form onSubmit={submit}>
          <div className="form-group"><label>Subject</label><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required/></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} required/></div>
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </Modal>}
      {selected&&<Modal title="Review Complaint" onClose={()=>setSelected(null)}>
        <p style={{color:'var(--text-muted)',marginBottom:'1rem',fontSize:'0.875rem'}}>{selected.description}</p>
        <div className="form-group"><label>Update Status</label><select value={review.status} onChange={e=>setReview(r=>({...r,status:e.target.value}))}><option value="UNDER_REVIEW">Under Review</option><option value="RESOLVED">Resolved</option><option value="REJECTED">Rejected</option></select></div>
        <div className="form-group"><label>Admin Note</label><textarea value={review.adminNote} onChange={e=>setReview(r=>({...r,adminNote:e.target.value}))} rows={3} placeholder="Add a note for the complainant..."/></div>
        {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
        <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={()=>setSelected(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>updateStatus(selected.id)}>Update Status</button>
        </div>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── RUMORS PAGE ───────────────────────────────────────────────
w('src/app/dashboard/rumors/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Rumor { id:string; title:string; description:string; status:string; reportedBy:{name:string}; clarification:string|null; createdAt:string; }
interface UserInfo { name:string; role:string; email:string; }

export default function RumorsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [rumors, setRumors] = useState<Rumor[]>([]);
  const [selected, setSelected] = useState<Rumor|null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', description:'' });
  const [verify, setVerify] = useState({ status:'VERIFIED_FALSE', clarification:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/rumors').then(r=>r.json()).then(d=>setRumors(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function report(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/rumors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({title:'',description:''});load(); } else setMsg(d.error);
  }

  async function doVerify(id:string) {
    const res = await fetch(\`/api/rumors/\${id}\`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(verify)});
    const d = await res.json();
    if (d.success) { setSelected(null);load(); } else setMsg(d.error);
  }

  if (!user) return null;
  const isAdmin = ['ADMIN','CHAIRMAN'].includes(user.role);

  return (
    <DashboardLayout title="Rumor Verification" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Rumor Verification</h1><p className="page-subtitle">Report, verify, and publish clarifications</p></div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Report Rumor</button>
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}</div>}
      <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
        {rumors.length===0?<div className="empty-state"><div className="empty-state-icon">🔍</div><p>No rumors reported</p></div>
        :rumors.map(r=>(
          <div key={r.id} className="card">
            <div className="flex-between" style={{marginBottom:'0.75rem'}}>
              <h3 style={{fontWeight:600}}>{r.title}</h3>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <Badge status={r.status}/>
                {isAdmin&&r.status==='UNDER_REVIEW'&&<button className="btn btn-primary btn-sm" onClick={()=>{setSelected(r);setVerify({status:'VERIFIED_FALSE',clarification:''});}}>Verify</button>}
              </div>
            </div>
            <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'0.75rem'}}>{r.description}</p>
            {r.clarification&&<div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'0.75rem',fontSize:'0.875rem'}}>
              <strong style={{color:'#10b981'}}>✅ Official Clarification:</strong><p style={{marginTop:'0.4rem'}}>{r.clarification}</p>
            </div>}
            <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.75rem'}}>Reported by {r.reportedBy.name} • {new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      {showCreate&&<Modal title="Report Rumor" onClose={()=>setShowCreate(false)}>
        <form onSubmit={report}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} required/></div>
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Report</button>
          </div>
        </form>
      </Modal>}
      {selected&&<Modal title={"Verify: "+selected.title} onClose={()=>setSelected(null)}>
        <p style={{color:'var(--text-muted)',marginBottom:'1rem',fontSize:'0.875rem'}}>{selected.description}</p>
        <div className="form-group"><label>Verification Result</label>
          <select value={verify.status} onChange={e=>setVerify(v=>({...v,status:e.target.value}))}>
            <option value="VERIFIED_TRUE">Verified True</option>
            <option value="VERIFIED_FALSE">Verified False</option>
            <option value="PUBLISHED">Publish Clarification</option>
            <option value="UNDER_REVIEW">Keep Under Review</option>
          </select>
        </div>
        <div className="form-group"><label>Clarification Statement</label><textarea value={verify.clarification} onChange={e=>setVerify(v=>({...v,clarification:e.target.value}))} rows={3} placeholder="Official party statement..."/></div>
        {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
        <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={()=>setSelected(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>doVerify(selected.id)}>Submit Verification</button>
        </div>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── NEWS PAGE ─────────────────────────────────────────────────
w('src/app/dashboard/news/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';

interface NewsItem { id:string; title:string; content:string; publishedBy:{name:string}; _count:{comments:number;reactions:number}; createdAt:string; }
interface UserInfo { id:string; name:string; role:string; email:string; }

export default function NewsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selected, setSelected] = useState<NewsItem|null>(null);
  const [comments, setComments] = useState<{id:string;content:string;user:{name:string};createdAt:string}[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', content:'' });
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/news').then(r=>r.json()).then(d=>setNews(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function openArticle(item:NewsItem) {
    setSelected(item);
    const d = await fetch(\`/api/news/\${item.id}/comments\`).then(r=>r.json());
    setComments(d.data||[]);
  }

  async function publish(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({title:'',content:''});load(); } else setMsg(d.error);
  }

  async function postComment(e:React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch(\`/api/news/\${selected.id}/comments\`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:comment})});
    const d = await res.json();
    if (d.success) { setComment(''); openArticle(selected); } else setMsg(d.error);
  }

  async function react(newsId:string) {
    await fetch(\`/api/news/\${newsId}/reactions\`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'LIKE'})});
    load();
  }

  if (!user) return null;
  const isAdmin = user.role==='ADMIN';

  return (
    <DashboardLayout title="Official Newsfeed" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Official Newsfeed</h1><p className="page-subtitle">Party announcements and official updates</p></div>
        {isAdmin&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Publish Article</button>}
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}</div>}
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {news.length===0?<div className="empty-state"><div className="empty-state-icon">📰</div><p>No news published yet</p></div>
        :news.map(n=>(
          <div key={n.id} className="card" style={{cursor:'pointer',transition:'transform 0.2s'}} onClick={()=>openArticle(n)} onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>(e.currentTarget.style.transform='')}>
            <h3 style={{fontWeight:700,fontSize:'1.05rem',marginBottom:'0.5rem'}}>{n.title}</h3>
            <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'0.875rem'}}>{n.content.substring(0,150)}...</p>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--text-muted)'}}>
              <span>by {n.publishedBy.name} • {new Date(n.createdAt).toLocaleDateString()}</span>
              <div style={{display:'flex',gap:'1rem'}}>
                <span onClick={e=>{e.stopPropagation();react(n.id);}} style={{cursor:'pointer',color:'var(--gold)'}}>👍 {n._count.reactions}</span>
                <span>💬 {n._count.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected&&<Modal title={selected.title} onClose={()=>setSelected(null)}>
        <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'1.25rem',lineHeight:1.7}}>{selected.content}</p>
        <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
          <h4 style={{fontSize:'0.875rem',fontWeight:600,marginBottom:'0.75rem'}}>💬 Comments ({comments.length})</h4>
          <div style={{maxHeight:200,overflowY:'auto',marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {comments.length===0?<p className="text-muted">No comments yet. Be the first!</p>
            :comments.map(c=>(
              <div key={c.id} style={{background:'var(--navy)',borderRadius:8,padding:'0.6rem 0.75rem'}}>
                <div style={{fontWeight:600,fontSize:'0.8rem',marginBottom:'0.2rem'}}>{c.user.name}</div>
                <div style={{fontSize:'0.875rem'}}>{c.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={postComment} style={{display:'flex',gap:'0.5rem'}}>
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." required style={{flex:1}}/>
            <button type="submit" className="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      </Modal>}
      {showCreate&&<Modal title="Publish News Article" onClose={()=>setShowCreate(false)}>
        <form onSubmit={publish}>
          <div className="form-group"><label>Headline</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
          <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={6} required/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
`);

// ── USERS PAGE ────────────────────────────────────────────────
w('src/app/dashboard/users/page.tsx',
`'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';

interface User { id:string; email:string; name:string; role:string; createdAt:string; }
interface UserInfo { name:string; role:string; email:string; }
const ROLES = ['ADMIN','CHAIRMAN','MINISTER','MP','PUBLIC'];

export default function UsersPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [changing, setChanging] = useState<{id:string;role:string}|null>(null);

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/users').then(r=>r.json()).then(d=>setUsers(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function updateRole(id:string, role:string) {
    await fetch('/api/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,role})});
    setChanging(null); load();
  }

  if (!user) return null;
  const filtered = filter ? users.filter(u=>u.role===filter) : users;

  return (
    <DashboardLayout title="User Management" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">{users.length} registered users</p></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{width:'auto'}}>
          <option value="">All Roles</option>
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--text-muted)'}}>No users found</td></tr>
            :filtered.map(u=>(
              <tr key={u.id}>
                <td style={{fontWeight:600}}>{u.name}</td>
                <td style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{u.email}</td>
                <td>{changing?.id===u.id?
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <select value={changing.role} onChange={e=>setChanging(c=>c?{...c,role:e.target.value}:null)} style={{width:'auto',padding:'0.25rem 0.5rem',fontSize:'0.8rem'}}>
                      {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={()=>updateRole(u.id,changing.role)}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setChanging(null)}>✕</button>
                  </div>
                  :<Badge status={u.role}/>}
                </td>
                <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>{changing?.id!==u.id&&<button className="btn btn-secondary btn-sm" onClick={()=>setChanging({id:u.id,role:u.role})}>Change Role</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
`);

console.log('\n✅ All feature pages done!');
