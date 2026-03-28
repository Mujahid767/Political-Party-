'use client';
export default function TopBar({ title, user }: { title: string; user: { name: string; role: string } }) {
  return (
    <div className="topbar">
      <div>
        <h1 style={{fontSize:'1.1rem',fontWeight:700}}>{title}</h1>
        <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Welcome back, {user.name}</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <span className="badge badge-gold">{user.role}</span>
        <div style={{width:1,height:24,background:'var(--border)'}}/>
        <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
        </span>
      </div>
    </div>
  );
}
