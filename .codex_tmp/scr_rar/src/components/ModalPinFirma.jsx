// ══════════════════════════════════════════════════════
// MODAL PIN FIRMA — ModalPinFirma.jsx
// Se abre al presionar "Guardar Evolución"
// El médico solo ingresa su PIN para firmar y guardar
// ══════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import { useHCU } from '../store/hcuStore';
import { useUserSession } from '../hooks';

export default function ModalPinFirma({ showToast, onSync }) {
  const { state, actions } = useHCU();
  const { firma } = state;
  const session = useUserSession(firma);

  const [open, setOpen]     = useState(false);
  const [pin, setPin]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef            = useRef(null);

  // Escuchar el evento global para abrir el modal
  useEffect(() => {
    const handler = () => {
      setPin('');
      setError('');
      setLoading(false);
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };
    window.addEventListener('atlas:openPinModal', handler);
    return () => window.removeEventListener('atlas:openPinModal', handler);
  }, []);

  const cerrar = () => { if (!loading) setOpen(false); };

  const confirmar = () => {
    if (!pin || pin.length < 4) {
      setError('⚠️ Ingrese el PIN del certificado (mínimo 4 dígitos)');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setLoading(true);

    // Simular proceso de firma
    // En producción: POST al endpoint firmador del servidor
    setTimeout(() => {
      const now     = new Date();
      const ts      = now.toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const pac     = state.paciente.nombres || 'Paciente';
      const hcl     = state.paciente.hcl || '—';
      const docStr  = pac + hcl + session.serie + now.getTime();
      let h = 0;
      for (let i = 0; i < docStr.length; i++) { h = ((h << 5) - h) + docStr.charCodeAt(i); h |= 0; }
      const docHash = `SHA256:${Math.abs(h).toString(16).toUpperCase().padStart(8, '0')}...${now.getTime().toString(36).toUpperCase().slice(-6)}`;

      // Persistir firma en el store
      actions.aplicarFirma({
        firmado : true,
        hash    : docHash,
        ts      : `Firmado digitalmente el ${ts} · Atlas HIS`,
        serie   : session.serie,
      });

      // Sincronizar bridge
      onSync?.();

      // Bridge localStorage
      try {
        localStorage.setItem('M8_FE_FIRMA', JSON.stringify({
          titular : session.nombre,
          cedula  : session.cedula,
          emisora : session.emisora,
          serie   : session.serie,
          validez : session.validez,
          hash    : docHash,
          ts      : now.toISOString(),
          paciente: pac,
          hcl,
          modulo  : 'HCU-Form.005',
        }));
      } catch (_) {}

      setPin('');
      setLoading(false);
      setOpen(false);
      showToast?.(`✅ Evolución firmada y guardada — ${session.nombre}`);
    }, 1200);
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') confirmar(); };

  if (!open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && cerrar()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,39,68,.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--white)', borderRadius: 16,
        boxShadow: 'var(--shadow-lg)',
        width: 'min(400px, 94vw)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--teal)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🔐</div>
          <div>
            <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'white' }}>Confirmar Firma Digital</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.45)', marginTop: 1 }}>Ingrese el PIN para firmar y guardar la evolución</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* Datos del médico */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: '.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 6 }}>Firmante</div>
            <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--navy)' }}>
              {session.nombre || 'Dr. Usuario Atlas'}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              {session.cedula || '—'}
            </div>
            <div style={{ fontSize: '.65rem', color: 'var(--green)', marginTop: 4, fontWeight: 600 }}>
              ● {session.emisora} · Certificado activo · Válido hasta {session.validez}
            </div>
          </div>

          {/* Campo PIN */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--teal-d)', marginBottom: 6 }}>
              PIN del certificado
            </label>
            <input
              ref={inputRef}
              type="password"
              maxLength={20}
              autoComplete="off"
              placeholder="••••••••"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={onKeyDown}
              disabled={loading}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.4rem', fontWeight: 700,
                letterSpacing: '.4em', textAlign: 'center',
                padding: 12,
                border: `2px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 9, outline: 'none',
                color: 'var(--navy)',
                transition: 'border-color .2s',
                opacity: loading ? .6 : 1,
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
            />
            {error && (
              <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--red-l)', border: '1px solid var(--red-mid)', borderRadius: 6, fontSize: '.72rem', color: 'var(--red)', fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={cerrar}
              disabled={loading}
              style={{ flex: 1, padding: 10, background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '.82rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer', color: 'var(--muted)', opacity: loading ? .5 : 1 }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={loading}
              style={{ flex: 2, padding: 10, background: loading ? 'var(--dim)' : 'var(--teal)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '.82rem', fontWeight: 700, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background .2s' }}
            >
              {loading ? '⏳ Firmando...' : '🔐 Firmar y Guardar'}
            </button>
          </div>

          <div style={{ fontSize: '.6rem', color: 'var(--dim)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
            Ley de Comercio Electrónico del Ecuador (Ley 2002-67) · Acuerdo MSP-00126-2021
          </div>
        </div>
      </div>
    </div>
  );
}
