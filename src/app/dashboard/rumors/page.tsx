'use client';
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
    const res = await fetch(`/api/rumors/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(verify)});
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
