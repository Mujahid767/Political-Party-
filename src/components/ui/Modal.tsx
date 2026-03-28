'use client';
interface Props { title: string; onClose: ()=>void; children: React.ReactNode; }
export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal animate-fade-in">
        <div className="flex-between mb-4">
          <h2 className="modal-title" style={{margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'1.25rem'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
