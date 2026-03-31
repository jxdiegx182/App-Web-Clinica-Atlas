// SeccionPrescripciones.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState } from 'react';
import { useHCU } from '../store/hcuStore';
import { useCalcDosis } from '../hooks';
import { Card, SL, FieldGroup, Input, Select } from './UIComponents';
import { MED_DB } from '../data/clinicalDB';

const STATUS_CLR = {
  pendiente: 'var(--amber)',
  enviada: 'var(--blue)',
  despachada: 'var(--green)',
  descontinuada: 'var(--red)',
};
const FRECS = [
  'Cada 6h',
  'Cada 8h',
  'Cada 12h',
  'Cada 24h',
  'Una sola dosis (dosis única)',
  'PRN (si precisa)',
  'Infusión continua 24h',
];
const VIAS = ['VO', 'IV', 'IM', 'SC', 'SL', 'Tópico', 'Inhalado'];

function MedBuscador({ onSelect }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);

  const buscar = (v) => {
    setQ(v);
    if (v.length < 2) {
      setRes([]);
      return;
    }
    const vl = v.toLowerCase();
    setRes(
      MED_DB.filter(
        (m) =>
          m.n.toLowerCase().includes(vl) ||
          (m.com || '').toLowerCase().includes(vl)
      ).slice(0, 10)
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        placeholder="Buscar medicamento..."
        value={q}
        onChange={(e) => buscar(e.target.value)}
      />
      {res.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 300,
            background: 'var(--white)',
            border: '1.5px solid var(--teal)',
            borderRadius: 9,
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {res.map((m, i) => (
            <div
              key={i}
              onMouseDown={() => {
                onSelect(m);
                setQ('');
                setRes([]);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--surface2)',
                fontSize: '.78rem',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--teal-l)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <strong style={{ color: 'var(--navy)' }}>{m.n}</strong>
              {m.com && (
                <span
                  style={{
                    color: 'var(--muted)',
                    marginLeft: 6,
                    fontSize: '.7rem',
                  }}
                >
                  {m.com}
                </span>
              )}
              {m.conc && (
                <span
                  style={{
                    color: 'var(--teal-d)',
                    marginLeft: 6,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '.68rem',
                  }}
                >
                  {m.conc}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeccionPrescripciones({ showToast }) {
  const { state, actions } = useHCU();
  const { calcular } = useCalcDosis();
  const [frm, setFrm] = useState({
    dosis: '',
    frec: 'Cada 8h',
    via: 'VO',
    dur: '',
    urgente: false,
  });
  const [medSel, setMedSel] = useState(null);

  const selMed = (m) => {
    setMedSel(m);
    setFrm((f) => ({
      ...f,
      dosis: m.conc?.split('/')[0]?.trim() || '',
      frec: m.frec || f.frec,
      via: m.via || f.via,
    }));
  };

  const agregar = () => {
    if (!medSel) {
      showToast('⚠ Seleccione un medicamento', 'err');
      return;
    }
    const calc = calcular({
      dosis: frm.dosis,
      conc: medSel.conc,
      frec: frm.frec,
    });
    actions.addRx({ ...medSel, ...frm, ...calc });
    showToast(`✅ ${medSel.n} agregado al Kárdex`);
    setMedSel(null);
    setFrm({ dosis: '', frec: 'Cada 8h', via: 'VO', dur: '', urgente: false });
  };

  return (
    <Card
      icon="💊"
      title="Prescripciones Médicas — Kárdex"
      badge={state.rxList.length}
      colorClass="ch-purple"
    >
      {/* Formulario */}
      <SL>Agregar Medicamento</SL>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
          gap: 8,
          alignItems: 'flex-end',
          marginBottom: 12,
        }}
      >
        <FieldGroup label="Medicamento *">
          <MedBuscador onSelect={selMed} />
          {medSel && (
            <div
              style={{
                fontSize: '.68rem',
                color: 'var(--teal-d)',
                marginTop: 3,
                fontWeight: 600,
              }}
            >
              ✅ {medSel.n} — {medSel.conc}
            </div>
          )}
        </FieldGroup>
        <FieldGroup label="Dosis">
          <Input
            value={frm.dosis}
            onChange={(e) => setFrm((f) => ({ ...f, dosis: e.target.value }))}
            placeholder="ej: 500mg"
            mono
          />
        </FieldGroup>
        <FieldGroup label="Frecuencia">
          <Select
            value={frm.frec}
            onChange={(e) => setFrm((f) => ({ ...f, frec: e.target.value }))}
          >
            {FRECS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup label="Vía">
          <Select
            value={frm.via}
            onChange={(e) => setFrm((f) => ({ ...f, via: e.target.value }))}
          >
            {VIAS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </FieldGroup>
        <button
          onClick={agregar}
          style={{
            padding: '7px 18px',
            background: 'var(--purple)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'inherit',
            fontSize: '.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 1,
          }}
        >
          + Agregar
        </button>
      </div>

      {/* Tabla Kárdex */}
      {state.rxList.length === 0 ? (
        <p
          style={{
            fontSize: '.8rem',
            color: 'var(--dim)',
            fontStyle: 'italic',
          }}
        >
          Sin prescripciones registradas.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '.77rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    'linear-gradient(135deg,var(--navy),var(--navy-mid))',
                }}
              >
                {[
                  'Medicamento',
                  'Dosis',
                  'Frecuencia',
                  'Vía',
                  'Cálculo',
                  'Estado',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      color: 'white',
                      fontSize: '.62rem',
                      fontWeight: 700,
                      letterSpacing: '.06em',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.rxList.map((rx) => (
                <tr
                  key={rx.id}
                  style={{
                    borderBottom: '1px solid var(--surface2)',
                    opacity: rx.status === 'descontinuada' ? 0.5 : 1,
                  }}
                >
                  <td
                    style={{
                      padding: '8px 10px',
                      fontWeight: 700,
                      color: 'var(--navy)',
                    }}
                  >
                    {rx.urgente && (
                      <span style={{ color: 'var(--red)', marginRight: 4 }}>
                        🚨
                      </span>
                    )}
                    {rx.nom || rx.nombre}
                    {rx.com && (
                      <div
                        style={{
                          fontSize: '.68rem',
                          color: 'var(--muted)',
                          fontWeight: 400,
                        }}
                      >
                        {rx.com}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '.75rem',
                    }}
                  >
                    {rx.dosis || rx.conc}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      fontSize: '.72rem',
                      color: 'var(--muted)',
                    }}
                  >
                    {rx.frec || rx.frecuencia}
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: '.72rem' }}>
                    {rx.via}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      fontSize: '.68rem',
                      color: 'var(--teal-d)',
                    }}
                  >
                    {rx.calcTxt || '—'}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 100,
                        fontSize: '.62rem',
                        fontWeight: 700,
                        background: `${
                          STATUS_CLR[rx.status] || 'var(--muted)'
                        }22`,
                        color: STATUS_CLR[rx.status] || 'var(--muted)',
                        border: `1px solid ${
                          STATUS_CLR[rx.status] || 'var(--border)'
                        }55`,
                      }}
                    >
                      {rx.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 6px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          actions.enviarFarmacia(
                            rx.id,
                            state.paciente.nombres,
                            `${state.paciente.sala}-${state.paciente.cama}`
                          );
                          showToast('🏥 Enviado a Farmacia');
                        }}
                        disabled={rx.status !== 'pendiente'}
                        style={{
                          padding: '3px 8px',
                          background: 'var(--teal-l)',
                          border: '1px solid var(--teal)',
                          color: 'var(--teal-d)',
                          borderRadius: 5,
                          fontSize: '.68rem',
                          cursor: 'pointer',
                          fontWeight: 700,
                          opacity: rx.status !== 'pendiente' ? 0.4 : 1,
                        }}
                      >
                        🏥
                      </button>
                      <button
                        onClick={() => {
                          actions.removeRx(rx.id);
                          showToast('Prescripción eliminada');
                        }}
                        style={{
                          padding: '3px 7px',
                          background: 'var(--red-l)',
                          border: '1px solid var(--red-mid)',
                          color: 'var(--red)',
                          borderRadius: 5,
                          fontSize: '.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
