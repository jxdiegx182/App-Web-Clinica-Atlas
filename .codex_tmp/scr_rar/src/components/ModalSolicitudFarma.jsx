// ModalSolicitudFarma.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState, useEffect } from 'react';
import { useHCU } from '../store/hcuStore';

export default function ModalSolicitudFarma({ showToast }) {
  const { state, actions } = useHCU();
  const [open, setOpen]   = useState(false);
  const [rxId, setRxId]   = useState(null);

  useEffect(() => {
    const h = e => { setRxId(e.detail?.rxId || null); setOpen(true); };
    window.addEventListener('atlas:solicitudFarma', h);
    // Enviar todo
    const hAll = () => {
      const pendientes = state.rxList.filter(r => r.status === 'pendiente');
      pendientes.forEach(rx => actions.enviarFarmacia(rx.id, state.paciente.nombres, `${state.paciente.sala}-${state.paciente.cama}`));
      showToast(`🏥 ${pendientes.length} pedidos enviados a Farmacia`);
    };
    window.addEventListener('atlas:enviarTodoFarmacia', hAll);
    return () => {
      window.removeEventListener('atlas:solicitudFarma', h);
      window.removeEventListener('atlas:enviarTodoFarmacia', hAll);
    };
  }, [state.rxList, state.paciente, actions, showToast]);

  if (!open) return null;
  const rx = rxId ? state.rxList.find(r => r.id === rxId) : null;

  const enviar = () => {
    if (rxId) {
      actions.enviarFarmacia(rxId, state.paciente.nombres, `${state.paciente.sala}-${state.paciente.cama}`);
      showToast('🏥 Enviado a Farmacia');
    }
    setOpen(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,28,50,.56)', backdropFilter: 'blur(5px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div style={{ background: 'var(--white)', borderRadius: 14, width: 'min(440px,94vw)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,var(--amber),#975a16)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '.9rem' }}>🏥</span>
          <span style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'white' }}>Solicitud a Farmacia</span>
          <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {rx ? (
            <div style={{ padding: '10px 14px', background: 'var(--amber-l)', border: '1px solid var(--amber-mid)', borderRadius: 8, fontSize: '.8rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{rx.nom || rx.nombre}</div>
              <div style={{ color: 'var(--muted)', marginTop: 4 }}>{rx.dosis} · {rx.frec || rx.frecuencia} · Vía: {rx.via}</div>
              {rx.calcTxt && <div style={{ fontSize: '.72rem', color: 'var(--teal-d)', marginTop: 4 }}>Cálculo: {rx.calcTxt}</div>}
            </div>
          ) : (
            <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Confirmar envío a Farmacia</p>
          )}
        </div>
        <div style={{ padding: '11px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '.79rem', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={enviar} style={{ padding: '8px 20px', background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 7, fontFamily: 'inherit', fontSize: '.79rem', fontWeight: 700, cursor: 'pointer' }}>🏥 Enviar a Farmacia</button>
        </div>
      </div>
    </div>
  );
}
