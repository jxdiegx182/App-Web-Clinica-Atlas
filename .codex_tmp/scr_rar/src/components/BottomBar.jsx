// BottomBar.jsx — MANFHER SYSTEMS · Atlas HIS
import { useHCU } from '../store/hcuStore';

export default function BottomBar({
  onGuardar,
  onImprimir,
  onAuditoria,
  onEnviarTodo,
}) {
  const { state } = useHCU();
  const rxCount = state.rxList.length;
  const pendCount = state.rxList.filter((r) => r.status === 'pendiente').length;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--navy)',
        borderTop: '2px solid var(--navy-d)',
        padding: '9px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(15,36,64,.3)',
      }}
    >
      {/* Estadísticas */}
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { l: 'Prescripciones', v: rxCount },
          { l: 'Pendientes Farmacia', v: pendCount },
          { l: 'Estado', v: state.auditoria.estado },
        ].map(({ l, v }) => (
          <div
            key={l}
            style={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <span
              style={{
                fontSize: '.57rem',
                color: 'rgba(255,255,255,.4)',
                fontWeight: 600,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {l}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '.8rem',
                color: 'var(--teal-mid)',
                fontWeight: 700,
              }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: '🏥 Enviar Todo Farmacia', fn: onEnviarTodo },
          { label: '📋 Auditoría', fn: onAuditoria },
          { label: '🖨️ Imprimir', fn: onImprimir },
          { label: '💾 Guardar y Firmar', fn: onGuardar, primary: true },
        ].map(({ label, fn, primary }) => (
          <button
            key={label}
            onClick={fn}
            style={{
              padding: '8px 15px',
              background: primary ? 'var(--teal)' : 'transparent',
              color: primary ? 'white' : 'rgba(255,255,255,.7)',
              border: `1.5px solid ${
                primary ? 'var(--teal)' : 'rgba(255,255,255,.25)'
              }`,
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: '.77rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
