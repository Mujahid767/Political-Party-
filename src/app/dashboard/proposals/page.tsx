'use client';
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
    await fetch(`/api/proposals/${id}`,{method:'PATCH'});
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
