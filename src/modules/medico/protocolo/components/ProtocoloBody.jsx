import { useState, useEffect } from 'react';
import SeccionProtocolo from './SeccionProtocolo';
import { HCUProvider } from '../store/hcuStore';
import { useHCU } from '../store/hcuStore';

// ── Clock ──
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div id="atl-clock" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '.7rem', color: 'rgba(255,255,255,.55)', textAlign: 'right', lineHeight: 1.7 }}>
      <div>{time.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div>{pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}</div>
    </div>
  );
}

// ── Toast ──
function Toast({ msg }) {
  return (
    <div id="toast" style={{
      position: 'fixed', top: 78, right: 22,
      background: 'var(--teal)', color: 'white',
      padding: '11px 18px', borderRadius: 9,
      fontSize: '.82rem', fontWeight: 700,
      boxShadow: 'var(--shadow-lg)',
      transform: msg ? 'translateX(0)' : 'translateX(140%)',
      transition: 'transform .3s ease', zIndex: 9999,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {msg}
    </div>
  );
}

// ── Inner App with access to store ──
function InnerApp() {
  const { state } = useHCU();
  const P = state.protocoloOperatorio;
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const navItems = [
    { id: 's-pac',              label: '🧑‍⚕️ Paciente' },
    { id: 's-op',               label: '⚙️ Operación' },
    { id: 's-equipo',           label: '👨‍⚕️ Equipo' },
    { id: 's-tiempos',          label: '⏱ Tiempos' },
    { id: 's-narr',             label: '📝 Descripción' },
    { id: 's-codes',            label: '🔢 Códigos' },
    { id: 's-equipos-insumos',  label: '🔧 Insumos' },
    { id: 's-comp',             label: '⚠️ Complicaciones' },
    { id: 's-ia',               label: '🤖 IA' },
  ];

  const navTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--bg-grad-from) 0%, var(--bg-grad-to) 100%)', backgroundAttachment: 'fixed' }}>

      {/* ── HEADER ── */}
      <header style={{ background: 'var(--navy)', borderBottom: '2px solid var(--navy-d)', padding: '9px 27px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 500, boxShadow: '0 3px 16px #76c4d5c5' }}>
        
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.15)', margin: '0 4px' }} />
        <div style={{ flex: 1 }}>
         <div style={{ fontSize: '.6rem', color: 'rgb(255, 255, 255)', letterSpacing: '.08em' }}>M.S-P HCU Form. 017 · Clínicas Atlas</div>
        </div>
        <Clock />
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 15px', background: 'var(--teal)', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 7, color: 'white', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-d)'; e.currentTarget.style.color = 'var(--teal-mid)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#76c4d5'; e.currentTarget.style.color = 'var(--teal-mid)'; }}
        >🖨️ Imprimir</button>
        <button
          onClick={() => showToast('✓ Protocolo guardado correctamente')}
          style={{ padding: '8px 15px', background: 'var(--teal)', border: '1.5px solid var(--teal)', borderRadius: 7, color: 'white', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all .2s' }}
          onMouseEnter={e => {e.currentTarget.style.background = 'var(--teal-d)'; e.currentTarget.style.color = 'var(--white)';}}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--teal-mid)'}
        >💾 Guardar</button>
      </header>

      {/* ── NAV STRIP ── */}
      <nav style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,.08)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px', display: 'flex' }}>
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => navTo(id)}
              style={{
                padding: '11px 18px', color: 'rgba(255,255,255,.48)', fontSize: '.78rem',
                fontWeight: 600, cursor: 'pointer', border: 'none', borderBottom: '2px solid transparent',
                whiteSpace: 'nowrap', transition: 'all .15s', display: 'flex', alignItems: 'center',
                gap: 6, background: 'transparent', fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.82)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.48)'}
            >{label}</button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main>
        <SeccionProtocolo showToast={showToast} />
      </main>

      {/* ── BOTTOM BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--navy)', borderTop: '2px solid var(--navy-d)',
        padding: '13px 28px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 100, boxShadow: '0 -4px 20px rgba(15,36,64,.3)',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[
            { label: 'Paciente',    value: P.paciente.nombres ? P.paciente.nombres.split(' ').slice(0,3).join(' ') : '—' },
            { label: 'ID',          value: P.paciente.id || '—' },
            { label: 'Alergias',    value: P.paciente.alergias || '—', red: true },
            { label: 'Tipo Cirugía',value: P.operacion.tipoCirugia?.toUpperCase() || '—' },
            { label: 'Duración Qx', value: P.tiempos.duracion || '—' },
          ].map(({ label, value, red }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.38)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '.86rem', color: red ? '#fc8181' : 'var(--teal-mid)', fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-mid)'; e.currentTarget.style.color = 'var(--teal-mid)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; e.currentTarget.style.color = 'white'; }}
          >🖨️ Imprimir</button>
          <button
            type="button"
            onClick={() => showToast('✓ Protocolo guardado correctamente')}
            style={{ padding: '9px 20px', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-d)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--teal-mid)'}
          >💾 Guardar Protocolo</button>
        </div>
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}

function Proto() {
  return (
    <HCUProvider>
      <InnerApp />
    </HCUProvider>
  );
}

export default Proto;

