'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UserInfo { id: string; name: string; role: string; email: string; }
interface SearchResult {
  id: string; name: string; role: string; createdAt: string;
  postCount: number; donationCount: number; totalDonated: number; eventsAttended: number;
}

const ROLE_GRADIENT: Record<string, string> = {
  ADMIN: '#ef4444,#dc2626', CHAIRMAN: '#f59e0b,#d97706',
  MINISTER: '#8b5cf6,#7c3aed', MP: '#3b82f6,#2563eb',
  PARTY_ADMIN: '#10b981,#059669', PUBLIC: '#64748b,#475569',
};
const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'badge-red', CHAIRMAN: 'badge-gold', MINISTER: 'badge-purple',
  MP: 'badge-blue', PUBLIC: 'badge-gray', PARTY_ADMIN: 'badge-green',
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function UserCard({ user, onClick }: { user: SearchResult; onClick: () => void }) {
  const grad = ROLE_GRADIENT[user.role] ?? ROLE_GRADIENT.PUBLIC;
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem',
        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg,${grad})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '1.1rem', color: '#fff',
      }}>
        {initials(user.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</span>
          <span className={`badge ${ROLE_COLOR[user.role] ?? 'badge-gray'}`} style={{ fontSize: '0.6rem' }}>{user.role}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>📝 {user.postCount} post{user.postCount !== 1 ? 's' : ''}</span>
          <span>💚 {user.donationCount} donation{user.donationCount !== 1 ? 's' : ''}</span>
          <span>🎪 {user.eventsAttended} event{user.eventsAttended !== 1 ? 's' : ''}</span>
          {user.totalDonated > 0 && <span style={{ color: '#f59e0b' }}>৳{user.totalDonated.toLocaleString()} donated</span>}
        </div>
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
    </div>
  );
}

export default function SearchPage() {
  const [me, setMe]         = useState<UserInfo | null>(null);
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.data));
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const d = await fetch(`/api/search/users?q=${encodeURIComponent(q)}`).then(r => r.json());
    setResults(d.data ?? []);
    setSearched(true);
    setLoading(false);
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  if (!me) return null;

  return (
    <DashboardLayout title="Search Users" user={me}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="page-header">
          <h1 className="page-title">🔍 Search Users</h1>
          <p className="page-subtitle">Find party members, view their posts and activity</p>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>🔍</div>
          <input
            id="user-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name…"
            style={{
              width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
              borderRadius: 16, fontSize: '1rem', boxSizing: 'border-box',
              border: '1px solid var(--border)', background: 'var(--card)',
              transition: 'border-color 0.2s',
            }}
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 82, borderRadius: 16 }} />)}
          </div>
        ) : results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            {results.map(u => (
              <UserCard key={u.id} user={u} onClick={() => router.push(`/dashboard/profile/${u.id}`)} />
            ))}
          </div>
        ) : searched ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>No users found for &quot;{query}&quot;. Try a different name.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '0.95rem' }}>Start typing to search for users…</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Minimum 2 characters required</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
