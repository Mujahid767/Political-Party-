'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';

interface NewsItem { id:string; title:string; content:string; publishedBy:{name:string}; _count:{comments:number;reactions:number}; createdAt:string; }
interface UserInfo { id:string; name:string; role:string; email:string; }

export default function NewsPage() {
  const [user, setUser] = useState<UserInfo|null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selected, setSelected] = useState<NewsItem|null>(null);
  const [comments, setComments] = useState<{id:string;content:string;user:{name:string};createdAt:string}[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', content:'' });
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.data)); },[]);
  const load = ()=>fetch('/api/news').then(r=>r.json()).then(d=>setNews(d.data||[]));
  useEffect(()=>{ load(); },[]);

  async function openArticle(item:NewsItem) {
    setSelected(item);
    const d = await fetch(`/api/news/${item.id}/comments`).then(r=>r.json());
    setComments(d.data||[]);
  }

  async function publish(e:React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d = await res.json();
    if (d.success) { setShowCreate(false);setForm({title:'',content:''});load(); } else setMsg(d.error);
  }

  async function postComment(e:React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch(`/api/news/${selected.id}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:comment})});
    const d = await res.json();
    if (d.success) { setComment(''); openArticle(selected); } else setMsg(d.error);
  }

  async function react(newsId:string) {
    await fetch(`/api/news/${newsId}/reactions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'LIKE'})});
    load();
  }

  if (!user) return null;
  const isAdmin = user.role==='ADMIN';

  return (
    <DashboardLayout title="Official Newsfeed" user={user}>
      <div className="page-header flex-between">
        <div><h1 className="page-title">Official Newsfeed</h1><p className="page-subtitle">Party announcements and official updates</p></div>
        {isAdmin&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Publish Article</button>}
      </div>
      {msg&&<div className="login-error" style={{marginBottom:'1rem'}}>{msg}</div>}
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {news.length===0?<div className="empty-state"><div className="empty-state-icon">📰</div><p>No news published yet</p></div>
        :news.map(n=>(
          <div key={n.id} className="card" style={{cursor:'pointer',transition:'transform 0.2s'}} onClick={()=>openArticle(n)} onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')} onMouseLeave={e=>(e.currentTarget.style.transform='')}>
            <h3 style={{fontWeight:700,fontSize:'1.05rem',marginBottom:'0.5rem'}}>{n.title}</h3>
            <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'0.875rem'}}>{n.content.substring(0,150)}...</p>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'var(--text-muted)'}}>
              <span>by {n.publishedBy.name} • {new Date(n.createdAt).toLocaleDateString()}</span>
              <div style={{display:'flex',gap:'1rem'}}>
                <span onClick={e=>{e.stopPropagation();react(n.id);}} style={{cursor:'pointer',color:'var(--gold)'}}>👍 {n._count.reactions}</span>
                <span>💬 {n._count.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected&&<Modal title={selected.title} onClose={()=>setSelected(null)}>
        <p style={{color:'var(--text-muted)',fontSize:'0.875rem',marginBottom:'1.25rem',lineHeight:1.7}}>{selected.content}</p>
        <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
          <h4 style={{fontSize:'0.875rem',fontWeight:600,marginBottom:'0.75rem'}}>💬 Comments ({comments.length})</h4>
          <div style={{maxHeight:200,overflowY:'auto',marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {comments.length===0?<p className="text-muted">No comments yet. Be the first!</p>
            :comments.map(c=>(
              <div key={c.id} style={{background:'var(--navy)',borderRadius:8,padding:'0.6rem 0.75rem'}}>
                <div style={{fontWeight:600,fontSize:'0.8rem',marginBottom:'0.2rem'}}>{c.user.name}</div>
                <div style={{fontSize:'0.875rem'}}>{c.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={postComment} style={{display:'flex',gap:'0.5rem'}}>
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." required style={{flex:1}}/>
            <button type="submit" className="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      </Modal>}
      {showCreate&&<Modal title="Publish News Article" onClose={()=>setShowCreate(false)}>
        <form onSubmit={publish}>
          <div className="form-group"><label>Headline</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
          <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={6} required/></div>
          {msg&&<p style={{color:'#f87171',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{msg}</p>}
          <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish</button>
          </div>
        </form>
      </Modal>}
    </DashboardLayout>
  );
}
