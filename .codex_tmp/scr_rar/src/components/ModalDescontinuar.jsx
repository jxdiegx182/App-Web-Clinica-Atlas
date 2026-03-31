// ModalDescontinuar.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState, useEffect } from 'react';
import { useHCU } from '../store/hcuStore';

const MOTIVOS = ['Reacción adversa', 'Objetivo terapéutico alcanzado', 'Cambio de esquema', 'Error de prescripción', 'Alta del paciente', 'Otro'];

export default function ModalDescontinuar({ showToast }) {
  const { state, actions } = useHCU();
  const [open, setOpen]   = useState(false);
  const [rxId, setRxId]   = useState(null);
  const [motivo, setMotivo] = useState('');
  const [obs, setObs]     = useState('');

  useEffect(() => {
    const handler = e => { setRxId(e.detail?.rxId || null); setOpen(true); setMotivo(''); setObs(''); };
    window.addEventListener('atlas:descontinuarRx', handler);
    return () => window.removeEventListener('atlas:descontinuarRx', handler);
  }, []);

  if (!open) return null;

  const rx = state.rxList.find(r => r.id === rxId);

  const confirmar = () => {
    if (!motivo) { showToast('⚠ Seleccione un motivo', 'err'); return; }
    actions.descontinuarRx(rxId, motivo, obs);
    showToast('❌ Prescripción descontinuada');
    setOpen(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,28,50,.56)', backdropFilter: 'blur(5px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div style={{ background: 'var(--white)', borderRadius: 14, width: 'min(480px,94vw)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--red)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '.9rem' }}>❌</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'white' }}>Descontinuar Prescripción</span>
          <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rx && <div style={{ padding: '8px 12px', background: 'var(--red-l)', borderRadius: 8, fontSize: '.8rem', fontWeight: 700, color: 'var(--red)' }}>{rx.nom || rx.nombre} — {rx.dosis} {rx.frec || rx.frecuencia}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Motivo *</label>
            <select className="fs" value={motivo} onChange={e => setMotivo(e.target.value)} style={{ width: '100%' }}>
              <option value="">— Seleccione motivo —</option>
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Observaciones</label>
            <textarea className="fta" value={obs} onChange={e => setObs(e.target.value)} placeholder="Detalles adicionales..." rows={3} style={{ width: '100%' }} />
          </div>
        </div>
        <div style={{ padding: '11px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '.79rem', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={confirmar} style={{ padding: '8px 20px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 7, fontFamily: 'inherit', fontSize: '.79rem', fontWeight: 700, cursor: 'pointer' }}>❌ Descontinuar</button>
        </div>
      </div>
    </div>
  );
}
