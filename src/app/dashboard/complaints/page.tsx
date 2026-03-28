'use client';
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
    const res = await fetch(`/api/complaints/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(review)});
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
