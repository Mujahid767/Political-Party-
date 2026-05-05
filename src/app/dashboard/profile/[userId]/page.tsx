'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

/* ─── Types ──────────────────────────────────────────────────── */
interface UserInfo { id: string; name: string; role: string; email: string; }
interface ProfileUser {
  id: string; name: string; email: string; role: string; bio: string | null;
  createdAt: string; totalDonated: number; eventsAttended: number;
  _count: { posts: number };
}
interface Post {
  id: string; content: string; imageUrl: string | null; createdAt: string;
  author: { id: string; name: string; role: string };
  _count: { comments: number; likes: number };
  likedByMe?: boolean;
}
interface Donation { id: string; amount: number; partyName: string; status: string; bkashTrxId: string | null; createdAt: string; }
interface EventHistory {
  id: string; role: string | null;
  event: { id: string; title: string; location: string; startDate: string; endDate: string; createdBy: { name: string } };
}

/* ─── Constants ─────────────────────────────────────────────── */
const ROLE_GRADIENT: Record<string, string> = {
  ADMIN: '#ef4444,#dc2626', CHAIRMAN: '#f59e0b,#d97706',
  MINISTER: '#8b5cf6,#7c3aed', MP: '#3b82f6,#2563eb',
  PARTY_ADMIN: '#10b981,#059669', PUBLIC: '#64748b,#475569',
};
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'badge-red', CHAIRMAN: 'badge-gold', MINISTER: 'badge-purple',
  MP: 'badge-blue', PUBLIC: 'badge-gray', PARTY_ADMIN: 'badge-green',
};
const STATUS_COLOR: Record<string, string> = {
  SUCCESS: '#10b981', PENDING: '#f59e0b', FAILED: '#ef4444',
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
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

/* ─── Post Card (simplified, no comments for profile view) ── */
function MiniPostCard({ post }: { post: Post }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem' }} />
      )}
      <p style={{ fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text)', marginBottom: '0.75rem' }}>
        {post.content}
      </p>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>👍 {post._count.likes}</span>
        <span>💬 {post._count.comments}</span>
        <span style={{ marginLeft: 'auto' }}>{timeAgo(post.createdAt)}</span>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [me, setMe]           = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts]     = useState<Post[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents]   = useState<EventHistory[]>([]);
  const [tab, setTab]         = useState<'posts' | 'donations' | 'events'>('posts');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/profile/${userId}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    const d = await res.json();
    if (d.success) {
      setProfile(d.data.user);
      setPosts(d.data.posts);
      setDonations(d.data.donations);
      setEvents(d.data.events);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { if (me) load(); }, [me, load]);

  if (!me) return null;

  const grad = profile ? (ROLE_GRADIENT[profile.role] ?? ROLE_GRADIENT.PUBLIC) : ROLE_GRADIENT.PUBLIC;
  const isOwnProfile = me.id === userId;

  return (
    <DashboardLayout title="Profile" user={me}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
        </div>
      ) : notFound ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>User not found.</p>
          <button className="btn btn-secondary" onClick={() => router.back()}>Go Back</button>
        </div>
      ) : profile && (
        <>
          {/* ── Profile Header Card ─────────────────────────────── */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, marginBottom: '1.5rem' }}>
            {/* Banner — rounded top corners, avatar absolutely positioned */}
            <div style={{ height: 120, background: `linear-gradient(135deg,${grad})`, position: 'relative', borderRadius: '20px 20px 0 0' }}>
              <div style={{
                position: 'absolute', bottom: -42, left: '1.75rem',
                width: 84, height: 84, borderRadius: '50%',
                background: `linear-gradient(135deg,${grad})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.75rem', color: '#fff',
                border: '4px solid var(--card)',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 6px 24px rgba(0,0,0,0.5)',
              }}>
                {initials(profile.name)}
              </div>
            </div>

            {/* Content area — entirely below the banner, solid bg, avatar cleared via paddingTop */}
            <div style={{ padding: '0 1.75rem 1.5rem', background: 'var(--card)', paddingTop: 54 }}>
              {/* Name + badges row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: 6 }}>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{profile.name}</h1>
                    <span className={`badge ${ROLE_COLOR[profile.role] ?? 'badge-gray'}`}>{profile.role}</span>
                    {isOwnProfile && <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
                {isOwnProfile && (
                  <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard/community')}>
                    ✏️ Go to Feed
                  </button>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>{profile.bio}</p>
              )}

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { label: 'Posts', value: profile._count.posts, icon: '📝' },
                  { label: 'Donated (BDT)', value: profile.totalDonated.toLocaleString(), icon: '💚' },
                  { label: 'Events', value: profile.eventsAttended, icon: '🎪' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.85rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {(['posts', 'donations', 'events'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: tab === t ? 'rgba(245,158,11,0.15)' : 'none',
                  border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
                  color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                  fontWeight: tab === t ? 700 : 400, cursor: 'pointer',
                  fontSize: '0.875rem', transition: 'all 0.2s',
                  borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                }}
              >
                {t === 'posts' && `📝 Posts (${posts.length})`}
                {t === 'donations' && `💚 Donations (${donations.length})`}
                {t === 'events' && `🎪 Events (${events.length})`}
              </button>
            ))}
          </div>

          {/* ── Tab Content ───────────────────────────────────── */}
          {tab === 'posts' && (
            posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No posts yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.map(p => <MiniPostCard key={p.id} post={p} />)}
              </div>
            )
          )}

          {tab === 'donations' && (
            donations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💚</div>
                <p>No donations yet.</p>
                {isOwnProfile && <button className="btn btn-primary" onClick={() => router.push('/dashboard/donate')}>Make a Donation</button>}
              </div>
            ) : (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'Party', 'Amount (BDT)', 'Status', 'bKash TrxID'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, i) => (
                      <tr key={d.id} style={{ borderBottom: i < donations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}>{d.partyName}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)' }}>৳{d.amount.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: `${STATUS_COLOR[d.status]}22`, color: STATUS_COLOR[d.status] ?? '#888', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${STATUS_COLOR[d.status] ?? '#888'}44` }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.bkashTrxId ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'events' && (
            events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎪</div>
                <p>No events attended yet.</p>
                {isOwnProfile && <button className="btn btn-primary" onClick={() => router.push('/dashboard/events')}>Browse Events</button>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {events.map(e => (
                  <div key={e.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🎪</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{e.event.title}</span>
                        {e.role && (
                          <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>
                            {e.role}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>📍 {e.event.location}</span>
                        <span>📅 {new Date(e.event.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </DashboardLayout>
  );
}
