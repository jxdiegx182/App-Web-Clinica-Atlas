// ══════════════════════════════════════════════════════
// PanelFarmacia.jsx — MANFHER SYSTEMS · Atlas HIS
// Cola de despacho — visualización completa del Kárdex
// ══════════════════════════════════════════════════════
import { useState } from 'react';
import { useHCU } from '../store/hcuStore';
import { Card, SL, StatusBadge, Btn, Modal, ModalHeader, ModalBody, ModalFooter } from './UIComponents';

// ── Contadores resumen por estado ──────────────────────
function ContadorEstado({ label, count, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 16px',
      background: `${color}18`,
      border: `1.5px solid ${color}44`,
      borderRadius: 9, minWidth: 80,
    }}>
      <span style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '1.3rem', fontWeight: 800, color,
      }}>
        {count}
      </span>
      <span style={{ fontSize: '.6rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}

// ── Fila de la cola ────────────────────────────────────
function FilaFarmacia({ item, onDespachar, onVerDetalle, showToast }) {
  const urgente = item.urgente;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--surface2)',
      background: urgente ? '#fff5f5' : 'var(--white)',
      transition: 'background .12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = urgente ? '#ffe8e8' : 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = urgente ? '#fff5f5' : 'var(--white)'}
    >
      {/* Indicador urgente */}
      <div style={{
        flexShrink: 0, width: 4, alignSelf: 'stretch',
        borderRadius: 4,
        background: urgente ? 'var(--red)' : item.status === 'despachada' ? 'var(--green)' : 'var(--border)',
      }} />

      {/* Info principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {urgente && (
            <span style={{
              fontSize: '.6rem', fontWeight: 800, color: 'var(--red)',
              background: 'var(--red-l)', border: '1px solid var(--red-mid)',
              padding: '1px 6px', borderRadius: 100, letterSpacing: '.06em', textTransform: 'uppercase',
            }}>
              🚨 URGENTE
            </span>
          )}
          <span style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--navy)' }}>
            {item.nom || item.nombre}
          </span>
          {item.com && (
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{item.com}</span>
          )}
        </div>

        <div style={{ marginTop: 4, fontSize: '.72rem', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {item.dosis && <span>💊 {item.dosis}</span>}
          {(item.frec || item.frecuencia) && <span>🕐 {item.frec || item.frecuencia}</span>}
          {item.via && <span>📍 {item.via}</span>}
          {item.hora && <span>⏱ Pedido: {item.hora}</span>}
        </div>

        {item.calcTxt && (
          <div style={{ marginTop: 3, fontSize: '.69rem', color: 'var(--teal-d)', fontFamily: "'JetBrains Mono',monospace" }}>
            {item.calcTxt}
          </div>
        )}

        {/* Datos del paciente/cama */}
        {(item.pac || item.cama_id) && (
          <div style={{ marginTop: 3, fontSize: '.69rem', color: 'var(--navy-mid)', fontWeight: 600 }}>
            👤 {item.pac || '—'} · 🛏 {item.cama_id || '—'}
          </div>
        )}

        {item.pedido_id && (
          <div style={{
            marginTop: 4, fontSize: '.62rem',
            fontFamily: "'JetBrains Mono',monospace",
            color: 'var(--dim)',
          }}>
            {item.pedido_id}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <StatusBadge status={item.status} />

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onVerDetalle(item)}
            style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'var(--navy-l)', border: '1px solid var(--border)',
              color: 'var(--navy)', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            📋 Ver
          </button>

          {item.status === 'enviada' && (
            <button
              onClick={() => onDespachar(item.id)}
              style={{
                padding: '4px 12px', borderRadius: 6,
                background: 'var(--green)', border: 'none',
                color: 'white', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              ✓ Despachar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal de detalle ────────────────────────────────────
function ModalDetalle({ item, open, onClose }) {
  if (!item) return null;
  const rows = [
    ['Medicamento', item.nom || item.nombre],
    ['Composición', item.com],
    ['Concentración', item.conc],
    ['Dosis prescrita', item.dosis],
    ['Frecuencia', item.frec || item.frecuencia],
    ['Vía de administración', item.via],
    ['Duración', item.dur],
    ['Unidades farmacia', item.farmUnidades ?? '—'],
    ['Cálculo', item.calcTxt],
    ['Paciente', item.pac],
    ['Cama', item.cama_id],
    ['Hora de pedido', item.hora],
    ['ID de pedido', item.pedido_id],
    ['Estado', item.status],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  return (
    <Modal open={open} onClose={onClose} width="500px">
      <ModalHeader icon="🏥" title="Detalle del Pedido a Farmacia" />
      <ModalBody>
        {item.urgente && (
          <div style={{
            marginBottom: 12, padding: '8px 14px',
            background: 'var(--red-l)', border: '1.5px solid var(--red-mid)',
            borderRadius: 8, fontSize: '.8rem', fontWeight: 700, color: 'var(--red)',
          }}>
            🚨 PEDIDO URGENTE — Despacho prioritario
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid var(--surface2)' }}>
                <td style={{ padding: '7px 10px', color: 'var(--muted)', fontWeight: 600, width: '42%', whiteSpace: 'nowrap' }}>
                  {label}
                </td>
                <td style={{
                  padding: '7px 10px', color: 'var(--navy)', fontWeight: 500,
                  fontFamily: label === 'ID de pedido' || label === 'Cálculo' ? "'JetBrains Mono',monospace" : 'inherit',
                  fontSize: label === 'ID de pedido' ? '.7rem' : 'inherit',
                }}>
                  {String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalBody>
      <ModalFooter>
        <Btn variant="outline" onClick={onClose}>Cerrar</Btn>
      </ModalFooter>
    </Modal>
  );
}

// ── Componente principal ────────────────────────────────
export default function PanelFarmacia({ showToast }) {
  const { state, actions } = useHCU();
  const cola = state.farmaciaQueue;

  const [filtro,       setFiltro]       = useState('todas');
  const [detalleItem,  setDetalleItem]  = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Contadores
  const cnt = {
    total:       cola.length,
    pendiente:   cola.filter(f => f.status === 'pendiente').length,
    enviada:     cola.filter(f => f.status === 'enviada').length,
    despachada:  cola.filter(f => f.status === 'despachada').length,
  };

  // Items filtrados
  const items = filtro === 'todas' ? cola : cola.filter(f => f.status === filtro);
  // Urgentes siempre primero
  const itemsOrdenados = [...items].sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));

  const despachar = (id) => {
    actions.despacharMed(id);
    showToast?.('✅ Medicamento despachado');
  };

  const verDetalle = (item) => {
    setDetalleItem(item);
    setModalDetalle(true);
  };

  const FILTROS = [
    { key: 'todas',      label: 'Todas' },
    { key: 'enviada',    label: '📥 En Farmacia' },
    { key: 'pendiente',  label: '⏳ Pendientes' },
    { key: 'despachada', label: '✅ Despachadas' },
  ];

  return (
    <>
      <Card
        icon="🏥"
        title="Panel de Farmacia — Cola de Despacho"
        badge={cnt.total}
        badgeStyle={{
          background: cnt.enviada > 0 ? 'var(--amber)' : 'var(--teal)',
          color: 'white',
        }}
        colorClass="ch-amber"
      >
        {/* ── Contadores resumen ── */}
        {cnt.total > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <ContadorEstado label="Total"      count={cnt.total}      color="var(--navy)"  />
            <ContadorEstado label="En Farmacia"count={cnt.enviada}    color="var(--blue)"  />
            <ContadorEstado label="Pendientes" count={cnt.pendiente}  color="var(--amber)" />
            <ContadorEstado label="Despachados"count={cnt.despachada} color="var(--green)" />
          </div>
        )}

        {/* ── Filtros ── */}
        {cnt.total > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {FILTROS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                style={{
                  padding: '5px 13px', borderRadius: 100,
                  border: `1.5px solid ${filtro === key ? 'var(--amber)' : 'var(--border)'}`,
                  background: filtro === key ? 'var(--amber)' : 'var(--white)',
                  color: filtro === key ? 'white' : 'var(--muted)',
                  fontSize: '.72rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Lista de pedidos ── */}
        <div style={{
          border: '1px solid var(--border)', borderRadius: 9,
          overflow: 'hidden',
          background: 'var(--white)',
        }}>
          {itemsOrdenados.length === 0 ? (
            <div style={{
              padding: '32px', textAlign: 'center',
              color: 'var(--dim)', fontSize: '.82rem', fontStyle: 'italic',
            }}>
              {cola.length === 0
                ? 'Sin pedidos en cola — envíe medicamentos desde las Prescripciones'
                : `Sin pedidos con estado "${filtro}"`
              }
            </div>
          ) : (
            itemsOrdenados.map(item => (
              <FilaFarmacia
                key={item.id}
                item={item}
                onDespachar={despachar}
                onVerDetalle={verDetalle}
                showToast={showToast}
              />
            ))
          )}
        </div>

        {/* ── Acciones globales ── */}
        {cnt.enviada > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                cola.filter(f => f.status === 'enviada').forEach(f => actions.despacharMed(f.id));
                showToast?.(`✅ ${cnt.enviada} medicamento(s) despachados`);
              }}
              style={{
                padding: '8px 18px',
                background: 'var(--green)', color: 'white',
                border: 'none', borderRadius: 8,
                fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              ✓ Despachar todos los pendientes ({cnt.enviada})
            </button>
          </div>
        )}

        {/* ── Nota de integración ── */}
        <div style={{
          marginTop: 14, padding: '8px 14px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, fontSize: '.7rem', color: 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🔗</span>
          <span>
            Los pedidos se sincronizan vía{' '}
            <code style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--teal-d)', fontSize: '.68rem' }}>
              M8_BRIDGE_HCU_FARMACIA
            </code>{' '}
            · Bridge listo para{' '}
            <code style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--teal-d)', fontSize: '.68rem' }}>
              POST /api/farmacia
            </code>
          </span>
        </div>
      </Card>

      {/* Modal de detalle */}
      <ModalDetalle
        item={detalleItem}
        open={modalDetalle}
        onClose={() => setModalDetalle(false)}
      />
    </>
  );
}
