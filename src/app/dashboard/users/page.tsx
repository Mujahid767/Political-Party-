'use client';
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
