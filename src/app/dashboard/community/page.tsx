'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

/* ─── Types ─────────────────────────────────────────────────── */
interface Author { id: string; name: string; role: string; }
interface Post {
  id: string; content: string; imageUrl: string | null;
  author: Author; createdAt: string;
  _count: { comments: number; likes: number };
  likedByMe: boolean;
}
interface Comment { id: string; content: string; author: Author; createdAt: string; }
interface UserInfo { id: string; name: string; role: string; email: string; }

/* ─── Role badge colours ─────────────────────────────────────── */
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'badge-red', CHAIRMAN: 'badge-gold', MINISTER: 'badge-purple',
  MP: 'badge-blue', PUBLIC: 'badge-gray',
};

/* ─── Helpers ────────────────────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const ROLE_GRADIENT: Record<string, string> = {
  ADMIN: '#ef4444,#dc2626', CHAIRMAN: '#f59e0b,#d97706',
  MINISTER: '#8b5cf6,#7c3aed', MP: '#3b82f6,#2563eb', PUBLIC: '#64748b,#475569',
};

/* ─── PostCard ───────────────────────────────────────────────── */
function PostCard({ post, user, onLike, onDelete }: {
  post: Post; user: UserInfo;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [likes, setLikes] = useState(post._count.likes);
  const [liked, setLiked] = useState(post.likedByMe);
  const [imgExpanded, setImgExpanded] = useState(false);

  const canDelete = user.id === post.author.id || user.role === 'ADMIN' || user.role === 'CHAIRMAN';
  const gradient = ROLE_GRADIENT[post.author.role] ?? ROLE_GRADIENT.PUBLIC;

  async function loadComments() {
    if (loadingComments) return;
    setLoadingComments(true);
    const d = await fetch(`/api/posts/${post.id}/comments`).then(r => r.json());
    setComments(d.data ?? []);
    setLoadingComments(false);
  }

  function toggleComments() {
    if (!showComments) loadComments();
    setShowComments(s => !s);
  }

  async function handleLike() {
    setLiked(l => !l);
  setLikes((l: number) => liked ? l - 1 : l + 1);
    onLike(post.id);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText }),
    });
    const d = await res.json();
    if (d.success) { setComments(c => [...c, d.data]); setCommentText(''); }
    setPostingComment(false);
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${gradient})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>
          {initials(post.author.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author.name}</span>
            <span className={`badge ${ROLE_COLOR[post.author.role] ?? 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>{post.author.role}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{timeAgo(post.createdAt)}</div>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(post.id)} title="Delete post"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', borderRadius: 6, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>🗑️</button>
        )}
      </div>

      {/* Caption */}
      <div style={{ padding: '0 1.25rem 0.875rem', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {post.content}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div style={{ cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => setImgExpanded(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: liked ? 'rgba(245,158,11,0.12)' : 'none', border: '1px solid ' + (liked ? 'rgba(245,158,11,0.3)' : 'var(--border)'), borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: liked ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }}>
          👍 {likes}
        </button>
        <button onClick={toggleComments} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showComments ? 'rgba(59,130,246,0.1)' : 'none', border: '1px solid ' + (showComments ? 'rgba(59,130,246,0.3)' : 'var(--border)'), borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: showComments ? '#60a5fa' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }}>
          💬 {post._count.comments + (comments.length > post._count.comments ? comments.length - post._count.comments : 0)}
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loadingComments ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>Loading…</p>
          ) : comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>No comments yet. Be first!</p>
          ) : comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_GRADIENT[c.author.role] ?? ROLE_GRADIENT.PUBLIC})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials(c.author.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: 'var(--navy-light)', borderRadius: '0 12px 12px 12px', padding: '0.5rem 0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.2rem' }}>{c.author.name} <span className={`badge ${ROLE_COLOR[c.author.role] ?? 'badge-gray'}`} style={{ fontSize: '0.55rem' }}>{c.author.role}</span></div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.content}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', paddingLeft: '0.5rem' }}>{timeAgo(c.createdAt)}</div>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_GRADIENT[user.role] ?? ROLE_GRADIENT.PUBLIC})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 4 }}>
              {initials(user.name)}
            </div>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" style={{ flex: 1, borderRadius: 20, padding: '0.45rem 0.875rem', fontSize: '0.85rem' }} />
            <button type="submit" disabled={postingComment || !commentText.trim()} className="btn btn-primary btn-sm" style={{ borderRadius: 20, flexShrink: 0 }}>Post</button>
          </form>
        </div>
      )}

      {/* Full image lightbox */}
      {imgExpanded && post.imageUrl && (
        <div onClick={() => setImgExpanded(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '1rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="full" style={{ maxWidth: '95vw', maxHeight: '95vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setImgExpanded(false)} style={{ position: 'fixed', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ─── Create Post Form ───────────────────────────────────────── */
function CreatePostForm({ user, onCreated }: { user: UserInfo; onCreated: (post: Post) => void }) {
  const [content, setContent] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const gradient = ROLE_GRADIENT[user.role] ?? ROLE_GRADIENT.PUBLIC;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError('Image must be under 4 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setImageData(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() { setImageData(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl: imageData }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Failed to post'); return; }
      setContent(''); setImageData(null); setImagePreview(null);
      if (fileRef.current) fileRef.current.value = '';
      onCreated(d.data);
    } catch { setError('Network error.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${gradient})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>
          {initials(user.name)}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user.name.split(' ')[0]}? Share a text or add a photo…`}
            rows={3}
            style={{ resize: 'vertical', borderRadius: 12, fontSize: '0.9rem', lineHeight: 1.6 }}
          />
          {imagePreview && (
            <div style={{ position: 'relative', marginTop: '0.75rem', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)', display: 'block' }} />
              <button onClick={removeImage} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          )}
          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.875rem' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} id="post-image-upload" />
            <label htmlFor="post-image-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderRadius: 8 }}>
              📷 Photo
            </label>
            <span style={{ flex: 1 }} />
            <button onClick={submit} disabled={loading || !content.trim()} className="btn btn-primary" style={{ borderRadius: 10 }}>
              {loading ? 'Posting…' : '🚀 Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function CommunityFeedPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.data));
  }, []);

  const loadPosts = useCallback(async (pg = 1) => {
    setLoading(true);
    const d = await fetch(`/api/posts?page=${pg}`).then(r => r.json());
    if (pg === 1) setPosts(d.data ?? []);
    else setPosts(prev => [...prev, ...(d.data ?? [])]);
    setPages(d.pages ?? 1);
    setPage(pg);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadPosts(1); }, [user, loadPosts]);

  function handleCreated(post: Post) {
    setPosts(prev => [{ ...post, likedByMe: false }, ...prev]);
  }

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, likedByMe: !p.likedByMe, _count: { ...p._count, likes: p._count.likes + (p.likedByMe ? -1 : 1) } }
      : p
    ));
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
  }

  if (!user) return null;

  return (
    <DashboardLayout title="Community Feed" user={user}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">🌐 Community Feed</h1>
          <p className="page-subtitle">Everyone can share — public to minister, all voices matter here</p>
        </div>

        {/* Create post */}
        <CreatePostForm user={user} onCreated={handleCreated} />

        {/* Posts */}
        {loading && posts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} user={user} onLike={handleLike} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Load more */}
        {page < pages && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={() => loadPosts(page + 1)} disabled={loading}>
              {loading ? 'Loading…' : 'Load more posts'}
            </button>
          </div>
        )}

        {!loading && page >= pages && posts.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', padding: '1rem 0' }}>
            ✨ You&apos;ve seen all posts
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
