'use client';
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
