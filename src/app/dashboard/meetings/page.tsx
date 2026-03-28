'use client';
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
