'use client';
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
