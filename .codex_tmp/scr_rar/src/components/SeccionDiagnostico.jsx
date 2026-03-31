// ══════════════════════════════════════════════════════
// SeccionDiagnostico.jsx — MANFHER SYSTEMS · Atlas HIS
// Diagnósticos CIE-10 — buscador, CIETag, tabla MSP
// ══════════════════════════════════════════════════════
import { useState } from 'react';
import { useHCU } from '../store/hcuStore';
import { Card, SL, FieldGroup, Input, SearchDropdown, CIETag } from './UIComponents';
import { CIE10_DB } from '../data/clinicalDB';

// ── Fila editable manual en la tabla MSP ────────────────
function FilaManual({ fila, idx, onChange, onRemove }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--surface2)' }}>
      <td style={{ padding: '5px 8px' }}>
        <Input
          value={fila.c}
          onChange={e => onChange(idx, 'c', e.target.value)}
          placeholder="Z72.0"
          mono
          style={{ width: 88 }}
        />
      </td>
      <td style={{ padding: '5px 8px' }}>
        <Input
          value={fila.d}
          onChange={e => onChange(idx, 'd', e.target.value)}
          placeholder="Descripción..."
          style={{ width: '100%', minWidth: 200 }}
        />
      </td>
      <td style={{ padding: '5px 8px' }}>
        <select
          className="fs"
          value={fila.tipo || 'Definitivo'}
          onChange={e => onChange(idx, 'tipo', e.target.value)}
          style={{ fontSize: '.72rem' }}
        >
          {['Definitivo', 'Presuntivo', 'Descartado'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '5px 6px', textAlign: 'center' }}>
        <button
          onClick={() => onRemove(idx)}
          style={{
            width: 24, height: 24,
            background: 'var(--red-l)', border: '1px solid var(--red-mid)',
            color: 'var(--red)', borderRadius: 5, cursor: 'pointer',
            fontSize: '.8rem', lineHeight: 1,
          }}
        >✕</button>
      </td>
    </tr>
  );
}

// ── Badge de tipo para filas bloqueadas ─────────────────
function TipoBadge({ tipo }) {
  const esPrincipal = tipo === 'Principal';
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 100, fontSize: '.62rem', fontWeight: 700,
      background: esPrincipal ? 'var(--teal-l)' : 'var(--navy-l)',
      color: esPrincipal ? 'var(--teal-d)' : 'var(--navy)',
      border: `1px solid ${esPrincipal ? 'var(--teal)' : 'var(--border)'}`,
    }}>
      {tipo}
    </span>
  );
}

// ── Componente principal ────────────────────────────────
export default function SeccionDiagnostico({ showToast }) {
  const { state, actions } = useHCU();
  const { main, sec } = state.diagnosticos;

  // Filas manuales adicionales (locales — no en el store global)
  const [tablaRows, setTablaRows] = useState([]);

  const agregarFila = () =>
    setTablaRows(prev => [...prev, { c: '', d: '', tipo: 'Definitivo' }]);

  const editarFila = (idx, campo, val) =>
    setTablaRows(prev => prev.map((f, i) => i === idx ? { ...f, [campo]: val } : f));

  const eliminarFila = (idx) =>
    setTablaRows(prev => prev.filter((_, i) => i !== idx));

  const totalDx = main.length + sec.length + tablaRows.filter(r => r.c || r.d).length;

  // Filas bloqueadas (de los buscadores) para la tabla unificada
  const filasLocked = [
    ...main.map(d => ({ ...d, tipo: 'Principal' })),
    ...sec.map(d => ({ ...d, tipo: 'Secundario' })),
  ];

  return (
    <Card
      icon="🔬"
      title="Diagnósticos CIE-10"
      badge={totalDx || undefined}
      badgeStyle={{ background: 'var(--navy-d)', color: 'white' }}
      colorClass="ch-navy"
    >

      {/* ── DIAGNÓSTICO PRINCIPAL ── */}
      <SL>Diagnóstico Principal</SL>
      <FieldGroup label="Buscar por código o nombre">
        <SearchDropdown
          inputId="dx-main"
          placeholder="Ej: I10 · Hipertensión, K37 · Apendicitis..."
          icon="🔬"
          db={CIE10_DB}
          onSelect={d => {
            actions.addDxMain(d);
            showToast?.(`✅ ${d.c} agregado como Dx principal`);
          }}
          renderOption={item => (
            <>
              <strong style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: 'var(--navy)', marginRight: 8, fontSize: '.78rem',
              }}>
                {item.c}
              </strong>
              <span style={{ color: 'var(--muted)', fontSize: '.77rem' }}>{item.d}</span>
            </>
          )}
          renderValue={item => `${item.c} — ${item.d}`}
        />
      </FieldGroup>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, minHeight: 34 }}>
        {main.length === 0
          ? <span style={{ fontSize: '.75rem', color: 'var(--dim)', fontStyle: 'italic' }}>
              Sin diagnóstico principal — busque un código CIE-10
            </span>
          : main.map(d => (
              <CIETag
                key={d.c}
                code={d.c}
                desc={d.d}
                onRemove={() => {
                  actions.removeDxMain(d.c);
                  showToast?.(`Dx ${d.c} eliminado`);
                }}
              />
            ))
        }
      </div>

      {/* ── DIAGNÓSTICOS SECUNDARIOS ── */}
      <SL style={{ marginTop: 16 }}>Diagnósticos Secundarios / Comorbilidades</SL>
      <FieldGroup label="Buscar CIE-10 secundario">
        <SearchDropdown
          inputId="dx-sec"
          placeholder="Comorbilidades, complicaciones..."
          icon="🔬"
          db={CIE10_DB}
          onSelect={d => {
            actions.addDxSec(d);
            showToast?.(`✅ ${d.c} agregado como Dx secundario`);
          }}
          renderOption={item => (
            <>
              <strong style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: 'var(--navy)', marginRight: 8, fontSize: '.78rem',
              }}>
                {item.c}
              </strong>
              <span style={{ color: 'var(--muted)', fontSize: '.77rem' }}>{item.d}</span>
            </>
          )}
          renderValue={item => `${item.c} — ${item.d}`}
        />
      </FieldGroup>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, minHeight: 34 }}>
        {sec.length === 0
          ? <span style={{ fontSize: '.75rem', color: 'var(--dim)', fontStyle: 'italic' }}>
              Sin diagnósticos secundarios
            </span>
          : sec.map(d => (
              <CIETag
                key={d.c}
                code={d.c}
                desc={d.d}
                onRemove={() => {
                  actions.removeDxSec(d.c);
                  showToast?.(`Dx secundario ${d.c} eliminado`);
                }}
              />
            ))
        }
      </div>

      {/* ── TABLA MSP FORM. 005 ── */}
      <SL style={{ marginTop: 16 }}>Tabla de Diagnósticos — MSP Form. 005</SL>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))' }}>
              {['Código CIE-10', 'Diagnóstico / Descripción', 'Tipo', ''].map(h => (
                <th key={h} style={{
                  padding: '8px 10px', color: 'white',
                  fontSize: '.61rem', fontWeight: 700,
                  letterSpacing: '.07em', textAlign: 'left', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Filas bloqueadas (de los buscadores) */}
            {filasLocked.map((d, i) => (
              <tr
                key={`lock-${d.c}-${i}`}
                style={{
                  borderBottom: '1px solid var(--surface2)',
                  background: i % 2 === 0 ? 'var(--white)' : 'var(--surface)',
                }}
              >
                <td style={{
                  padding: '8px 10px',
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700, color: 'var(--navy)', fontSize: '.75rem',
                }}>
                  {d.c}
                </td>
                <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{d.d}</td>
                <td style={{ padding: '8px 10px' }}>
                  <TipoBadge tipo={d.tipo} />
                </td>
                <td />
              </tr>
            ))}

            {/* Filas manuales editables */}
            {tablaRows.map((fila, idx) => (
              <FilaManual
                key={idx}
                fila={fila}
                idx={idx}
                onChange={editarFila}
                onRemove={eliminarFila}
              />
            ))}

            {/* Estado vacío */}
            {filasLocked.length === 0 && tablaRows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center', padding: '22px',
                    color: 'var(--dim)', fontSize: '.8rem', fontStyle: 'italic',
                  }}
                >
                  Sin diagnósticos registrados — busque un CIE-10 o agregue una fila manual
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={agregarFila}
        style={{
          marginTop: 10, padding: '7px 16px',
          background: 'var(--navy-l)', color: 'var(--navy)',
          border: '1.5px solid var(--border)', borderRadius: 8,
          fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
          transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy-l)'; e.currentTarget.style.color = 'var(--navy)'; }}
      >
        + Agregar fila manual
      </button>
    </Card>
  );
}
