'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_HOME: Record<string,string> = { ADMIN:'/dashboard/admin', CHAIRMAN:'/dashboard/chairman', MINISTER:'/dashboard/minister', MP:'/dashboard/mp', PUBLIC:'/dashboard/public' };
const DEMO = [
  { role:'Admin', email:'admin@party.gov', pass:'Admin@123' },
  { role:'Chairman', email:'chairman@party.gov', pass:'Chairman@123' },
  { role:'Minister', email:'minister@party.gov', pass:'Minister@123' },
  { role:'MP', email:'mp@party.gov', pass:'Mp@123456' },
  { role:'Public', email:'public@example.com', pass:'Public@123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function switchTab(t: 'login'|'register') {
    setTab(t); setError(''); setSuccess('');
    setEmail(''); setPassword(''); setName(''); setConfirm('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(ROLE_HOME[data.data.role] ?? '/dashboard/public');
    } catch { setError('Network error. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password,name}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      router.push('/dashboard/public');
    } catch { setError('Network error. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-hero-icon">🦁</div>
        <h1 className="login-hero-title">National Party<br/>Management Platform</h1>
        <p className="login-hero-sub">Secure, transparent, and efficient management of party operations, constituencies, and public engagement.</p>
        <div className="login-features">
          {['300 Parliamentary Constituencies','Cabinet Voting System','MP Meeting Management','Fund Transparency','Complaint & Rumor Management'].map(f=>(
            <div key={f} className="login-feature"><div className="login-feature-dot"/><span>{f}</span></div>
          ))}
        </div>
      </div>
      <div className="login-right">
        <div className="login-form">
          {/* ── Tab switcher ── */}
          <div style={{display:'flex',marginBottom:'2rem',background:'var(--card)',borderRadius:10,padding:4,border:'1px solid var(--border)'}}>
            {(['login','register'] as const).map(t=>(
              <button key={t} onClick={()=>switchTab(t)} style={{flex:1,padding:'0.6rem',border:'none',borderRadius:8,fontSize:'0.875rem',fontWeight:600,cursor:'pointer',transition:'all 0.2s',
                background: tab===t ? 'linear-gradient(135deg,var(--gold),var(--gold-dark))' : 'transparent',
                color: tab===t ? 'var(--navy)' : 'var(--silver)'}}>
                {t==='login' ? '🔐 Sign In' : '📝 Register'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <>
              <h2 className="login-form-title">Welcome Back</h2>
              <p className="login-form-sub">Sign in to access your dashboard</p>
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@party.gov" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input id="login-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
              </form>
              <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.8rem',color:'var(--text-muted)'}}>
                No account?{' '}
                <button onClick={()=>switchTab('register')} style={{background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontWeight:600,fontSize:'0.8rem'}}>Create one free</button>
              </p>
              <div style={{marginTop:'1.5rem',padding:'1rem',background:'var(--card)',borderRadius:10,border:'1px solid var(--border)'}}>
                <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'0.75rem',fontWeight:600}}>DEMO ACCOUNTS</p>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {DEMO.map(d=>(
                    <button key={d.role} onClick={()=>{setEmail(d.email);setPassword(d.pass);}}
                      style={{background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'0.4rem 0.75rem',color:'var(--silver)',cursor:'pointer',fontSize:'0.75rem',textAlign:'left',transition:'all 0.2s'}}
                      onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor='var(--gold)';(e.target as HTMLElement).style.color='var(--gold)';}}
                      onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor='var(--border)';(e.target as HTMLElement).style.color='var(--silver)';}}>
                      <strong>{d.role}</strong> — {d.email}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="login-form-title">Create Account</h2>
              <p className="login-form-sub">Register as a Public user to engage with the platform</p>
              {error && <div className="login-error">{error}</div>}
              {success && <div style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',color:'#34d399',padding:'0.75rem 1rem',borderRadius:8,fontSize:'0.875rem',marginBottom:'1rem'}}>{success}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input id="reg-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input id="reg-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" required/>
                </div>
                <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'0.65rem 0.875rem',marginBottom:'1rem',fontSize:'0.8rem',color:'var(--silver)'}}>
                  ℹ️ New accounts are automatically assigned the <strong style={{color:'var(--gold)'}}>Public</strong> role. Contact an Admin to upgrade your role.
                </div>
                <button type="submit" className="login-btn" disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
              </form>
              <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.8rem',color:'var(--text-muted)'}}>
                Already have an account?{' '}
                <button onClick={()=>switchTab('login')} style={{background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontWeight:600,fontSize:'0.8rem'}}>Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
