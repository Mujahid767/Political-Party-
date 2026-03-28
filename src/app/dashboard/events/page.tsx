'use client';
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
    const res = await fetch(`/api/events/${showRegister}/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(reg)});
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
