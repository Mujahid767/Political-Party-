'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Party { id: string; name: string; leader: string; ideology: string; parliamentaryPosition: string; alliances: Array<{ alliance: { name: string; founded: string; id: string } }> }
interface Alliance { id: string; name: string; founded: string; parties: Array<{ party: { name: string; leader: string } }> }

export default function AdminPartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState<Alliance | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/parties').then(r => r.json()),
      fetch('/api/alliances').then(r => r.json())
    ]).then(([pData, aData]) => {
      if (pData.success) setParties(pData.data);
      if (aData.success) setAlliances(aData.data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout title="Parties & Alliances" user={{ name: 'Admin', role: 'ADMIN', email: '' }}>
      <div className="page-header">
        <h1 className="page-title">Parties & Alliances</h1>
        <p className="page-subtitle">Manage political parties and their alliance structures.</p>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Leader</th>
                <th>Ideology</th>
                <th>Alliance Member</th>
                <th>Parliamentary Position</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem'}}>Loading...</td></tr> : parties.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.leader}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {p.ideology.split('\n').map(tg => <span key={tg} style={{ padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', borderRadius: 4, border: '1px solid var(--border)' }}>{tg}</span>)}
                    </div>
                  </td>
                  <td>
                    {p.alliances.length === 0 ? <span className="text-muted text-sm">—</span> : p.alliances.map(a => {
                      const al = alliances.find(al => al.id === a.alliance.id);
                      return (
                        <button key={a.alliance.id} onClick={() => setActiveModal(al!)} style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '0.25rem 0.5rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginRight: '0.25rem' }}>
                          {a.alliance.name} ↗
                        </button>
                      );
                    })}
                  </td>
                  <td><span className={p.parliamentaryPosition.includes('Government') ? 'badge badge-green' : 'badge badge-gray'}>{p.parliamentaryPosition}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: 500, background: 'var(--surface)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gold)' }}>{activeModal.name} Alliance</h2>
            <div className="text-muted text-sm" style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}><strong>Founded:</strong><br/>{activeModal.founded}</div>
            
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Parties ({activeModal.parties.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeModal.parties.map(p => (
                <div key={p.party.name} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: 600 }}>{p.party.name}</div>
                  <div className="text-sm text-muted">Leader: {p.party.leader}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
