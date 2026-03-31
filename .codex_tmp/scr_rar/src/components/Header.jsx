// Header.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState, useEffect } from 'react';
import { useHCU } from '../store/hcuStore';

export default function Header({ onGuardar, onImprimir }) {
  const { state } = useHCU();
  const [reloj, setReloj] = useState('');

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setReloj(
        n.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
        + '  ' + n.toTimeString().slice(0, 8)
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pac = state.paciente;
  const pacDisplay = [pac.apellido1, pac.apellido2, pac.nombre1, pac.nombre2].filter(Boolean).join(' ') || pac.nombres || '—';

  return (
    <header style={{
      background: 'var(--navy)', padding: '9px 24px', display: 'flex',
      alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 3px 16px rgba(15,36,64,.4)',
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
        Clínicas <span style={{ color: 'var(--teal-mid)' }}>ATLAS</span>
      </div>
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.15)' }} />

      {/* Título */}
      <div>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--teal-mid)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Form. 005 — Evolución y Prescripciones
        </div>
        <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', letterSpacing: '.06em' }}>
          MANFHER SYSTEMS · MSP Ecuador
        </div>
      </div>

      {/* Paciente rápido */}
      {pacDisplay !== '—' && (
        <>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.15)', marginLeft: 4 }} />
          <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
            👤 {pacDisplay}
            {pac.sala && <span style={{ marginLeft: 8, color: 'var(--teal-mid)', fontFamily: "'JetBrains Mono',monospace" }}>Sala {pac.sala} · Cama {pac.cama}</span>}
          </div>
        </>
      )}

      {/* Estado auditoría */}
      <div style={{
        marginLeft: 'auto', padding: '3px 10px', borderRadius: 6,
        background: state.auditoria.estado === 'FIRMADO DIGITALMENTE' ? 'rgba(39,103,73,.35)' : 'rgba(255,255,255,.08)',
        border: `1px solid ${state.auditoria.estado === 'FIRMADO DIGITALMENTE' ? 'var(--green-mid)' : 'rgba(255,255,255,.15)'}`,
        fontSize: '.65rem', fontWeight: 700,
        color: state.auditoria.estado === 'FIRMADO DIGITALMENTE' ? 'var(--green-mid)' : 'rgba(255,255,255,.5)',
        whiteSpace: 'nowrap',
      }}>
        {state.auditoria.estado === 'FIRMADO DIGITALMENTE' ? '✅ FIRMADO' : '📝 BORRADOR'}
      </div>

      {/* Reloj */}
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.65rem', color: 'rgba(255,255,255,.45)', whiteSpace: 'nowrap' }}>
        {reloj}
      </div>

      {/* Acciones */}
      <button onClick={onGuardar} style={{
        padding: '7px 16px', background: 'var(--teal)', color: 'white', border: 'none',
        borderRadius: 8, fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
        💾 Guardar
      </button>
      <button onClick={onImprimir} style={{
        padding: '7px 14px', background: 'transparent', color: 'rgba(255,255,255,.8)',
        border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 8,
        fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
        🖨️ Imprimir
      </button>
    </header>
  );
}
