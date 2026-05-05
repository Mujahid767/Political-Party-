'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface UserInfo { id: string; name: string; role: string; email: string; }
interface Party { id: string; name: string; leader: string; ideology: string; }
interface Leaderboard { partyName: string; total: number; count: number; }

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

const BKASH_PINK = '#E2136E';

function DonateContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [me, setMe]               = useState<UserInfo | null>(null);
  const [parties, setParties]     = useState<Party[]>([]);
  const [leaderboard, setLb]      = useState<Leaderboard[]>([]);
  const [selectedParty, setParty] = useState('');
  const [amount, setAmount]       = useState(500);
  const [customAmt, setCustom]    = useState('');
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const statusParam = params.get('status');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.data));
    fetch('/api/parties').then(r => r.json()).then(d => setParties(d.data ?? []));
    fetch('/api/donations?totals=true').then(r => r.json()).then(d => setLb(d.data ?? []));
  }, []);

  useEffect(() => {
    if (!statusParam) return;
    if (statusParam === 'success') setMsg({ type: 'success', text: '✅ Your donation was successful! Thank you for supporting the party.' });
    else if (statusParam === 'cancelled') setMsg({ type: 'info', text: 'ℹ️ Payment was cancelled.' });
    else setMsg({ type: 'error', text: '❌ Payment failed. Please try again.' });
  }, [statusParam]);

  const finalAmount = customAmt ? parseInt(customAmt, 10) : amount;

  async function handleMockPay() {
    if (!selectedParty) { setMsg({ type: 'error', text: 'Please select a party first.' }); return; }
    if (!finalAmount || finalAmount < 10) { setMsg({ type: 'error', text: 'Minimum donation is ৳10.' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, partyName: selectedParty, mock: true }),
      });
      const d = await res.json();
      if (!d.success) { setMsg({ type: 'error', text: d.error }); setLoading(false); return; }
      // Confirm immediately
      const confirmRes = await fetch(`/api/donations/confirm?donationId=${d.donationId}&mock=1`);
      if (confirmRes.redirected) {
        window.location.href = confirmRes.url;
      } else {
        setMsg({ type: 'success', text: '✅ Mock donation confirmed!' });
        fetch('/api/donations?totals=true').then(r => r.json()).then(dc => setLb(dc.data ?? []));
      }
    } catch { setMsg({ type: 'error', text: 'Network error.' }); }
    setLoading(false);
  }

  async function handleBkashPay() {
    if (!selectedParty) { setMsg({ type: 'error', text: 'Please select a party first.' }); return; }
    if (!finalAmount || finalAmount < 10) { setMsg({ type: 'error', text: 'Minimum donation is ৳10.' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, partyName: selectedParty }),
      });
      const d = await res.json();
      if (!d.success) { setMsg({ type: 'error', text: d.error }); setLoading(false); return; }
      if (d.bkashURL) window.location.href = d.bkashURL;
      else setMsg({ type: 'error', text: 'Could not get bKash payment URL.' });
    } catch { setMsg({ type: 'error', text: 'Network error.' }); }
    setLoading(false);
  }

  const maxDonationTotal = leaderboard.length > 0 ? leaderboard[0].total : 0;

  if (!me) return null;
  return (
    <DashboardLayout title="Donate" user={me}>
      <div className="page-header">
        <h1 className="page-title">💚 Donate to a Party</h1>
        <p className="page-subtitle">Support your chosen political party via bKash</p>
      </div>

      {msg && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 500,
          background: msg.type === 'success' ? 'rgba(16,185,129,0.12)' : msg.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
          color: msg.type === 'success' ? '#10b981' : msg.type === 'error' ? '#f87171' : '#60a5fa',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.1rem' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── Donation Form ─────────────────────────────────── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.75rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Make a Donation</h2>

          {/* Party selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Select Party</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem' }}>
              {parties.map(p => (
                <button
                  key={p.id}
                  onClick={() => setParty(p.name)}
                  style={{
                    padding: '0.75rem', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    background: selectedParty === p.name ? 'rgba(226,19,110,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedParty === p.name ? BKASH_PINK : 'var(--border)'}`,
                    color: selectedParty === p.name ? BKASH_PINK : 'var(--text)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.leader}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount presets */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Amount (BDT)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {PRESET_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustom(''); }}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                    background: amount === a && !customAmt ? 'rgba(226,19,110,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${amount === a && !customAmt ? BKASH_PINK : 'var(--border)'}`,
                    color: amount === a && !customAmt ? BKASH_PINK : 'var(--text)',
                  }}
                >
                  ৳{a.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>৳</span>
              <input
                type="number" min={10} placeholder="Custom amount…"
                value={customAmt}
                onChange={e => setCustom(e.target.value)}
                style={{ flex: 1, borderRadius: 10 }}
              />
            </div>
          </div>

          {/* Summary */}
          {selectedParty && finalAmount >= 10 && (
            <div style={{ background: 'rgba(226,19,110,0.08)', border: '1px solid rgba(226,19,110,0.25)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                You are donating <strong style={{ color: BKASH_PINK }}>৳{finalAmount.toLocaleString()}</strong> to <strong>{selectedParty}</strong>
              </p>
            </div>
          )}

          {/* Pay buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleBkashPay}
              disabled={loading || !selectedParty || finalAmount < 10}
              style={{
                flex: 1, minWidth: 180, padding: '0.875rem', borderRadius: 12, cursor: 'pointer',
                background: BKASH_PINK, border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                opacity: loading || !selectedParty ? 0.5 : 1, transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? 'Processing…' : '🟢 Pay with bKash'}
            </button>
            <button
              onClick={handleMockPay}
              disabled={loading || !selectedParty || finalAmount < 10}
              style={{
                padding: '0.875rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem',
                opacity: loading || !selectedParty ? 0.5 : 1, transition: 'all 0.2s',
              }}
            >
              🧪 Mock Pay
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            🔒 Payments processed via bKash Tokenized Checkout. Mock Pay is for testing only.
          </p>
        </div>

        {/* ── Leaderboard ───────────────────────────────────── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>🏆 Party Donation Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No donations yet. Be first! 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {leaderboard.map((entry, i) => {
                const pct = maxDonationTotal > 0 ? (entry.total / maxDonationTotal) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={entry.partyName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {medals[i] ?? `${i + 1}.`} {entry.partyName}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 700 }}>৳{entry.total.toLocaleString()}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${BKASH_PINK},#ff6b9d)`, borderRadius: 8, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{entry.count} donation{entry.count !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '1.25rem' }}
            onClick={() => router.push(`/dashboard/profile/${me?.id}`)}
          >
            View My Donation History →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={null}>
      <DonateContent />
    </Suspense>
  );
}
