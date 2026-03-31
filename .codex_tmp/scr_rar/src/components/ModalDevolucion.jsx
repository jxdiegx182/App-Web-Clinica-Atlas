// ModalDevolucion.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState, useEffect } from 'react';
import { useHCU } from '../store/hcuStore';

export default function ModalDevolucion({ showToast }) {
  const { state } = useHCU();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('atlas:openDevolucion', h);
    return () => window.removeEventListener('atlas:openDevolucion', h);
  }, []);

  if (!open) return null;

  const despachadas = state.farmaciaQueue.filter(f => f.status === 'despachada');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,28,50,.56)', backdropFilter: 'blur(5px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div style={{ background: 'var(--white)', borderRadius: 14, width: 'min(560px,94vw)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--navy)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '.9rem' }}>📋</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'white' }}>Auditoría — Devolución a Farmacia</span>
          <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px', maxHeight: '65vh', overflowY: 'auto' }}>
          {despachadas.length === 0 ? (
            <p style={{ fontSize: '.8rem', color: 'var(--dim)', fontStyle: 'italic' }}>Sin medicamentos despachados aún.</p>
          ) : (
            despachadas.map(item => (
              <div key={item.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--surface2)', fontSize: '.78rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.nom || item.nombre}</div>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>{item.dosis} · {item.frec || item.frecuencia} · Despachado: {item.hora}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.65rem', color: 'var(--dim)', marginTop: 2 }}>{item.pedido_id}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '11px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setOpen(false)} style={{ padding: '8px 18px', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 7, fontFamily: 'inherit', fontSize: '.79rem', fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
