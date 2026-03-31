// SeccionVitales.jsx — MANFHER SYSTEMS · Atlas HIS
import { useHCU } from '../store/hcuStore';
import { useIMC, useVitalesAlerts } from '../hooks';
import { Card, FieldGroup, Input, SL } from './UIComponents';

const CAMPOS = [
  { key: 'pa', label: 'PA (mmHg)', ph: '120/80' },
  { key: 'fc', label: 'FC (lpm)', ph: '72', type: 'number' },
  { key: 'fr', label: 'FR (rpm)', ph: '16', type: 'number' },
  { key: 'temp', label: 'Temp. (°C)', ph: '36.5', type: 'number' },
  { key: 'spo2', label: 'SpO₂ (%)', ph: '98', type: 'number' },
  { key: 'glucosa', label: 'Glucosa', ph: 'mg/dL', type: 'number' },
  { key: 'diuresis', label: 'Diuresis (ml)', ph: '—', type: 'number' },
  { key: 'hora', label: 'Hora Registro', ph: '', type: 'time' },
];

const ANTROP = [
  { key: 'peso', label: 'Peso (kg)', ph: '70', type: 'number' },
  { key: 'talla', label: 'Talla (cm)', ph: '170', type: 'number' },
  { key: 'perimetro', label: 'P. Abd (cm)', ph: '—', type: 'number' },
  { key: 'tallaFetal', label: 'Talla Fetal (s)', ph: '—', type: 'number' },
];

const CLR = { ok: 'var(--green)', warn: 'var(--amber)', alert: 'var(--red)' };

export default function SeccionVitales({ showToast }) {
  const { state, actions } = useHCU();
  const imc = useIMC();
  const { items, hasAlert } = useVitalesAlerts(state.vitales);

  const set = (k, v) => actions.setVitales({ [k]: v });

  const getAlertColor = (key) => {
    const item = items.find((it) => it.key === key);
    return item ? CLR[item.c] : 'var(--border)';
  };

  return (
    <Card
      icon="💓"
      title="Signos Vitales y Antropometría"
      badge={hasAlert ? '⚠️ ALERTA' : '✓ REGISTRADO'}
      badgeStyle={{
        background: hasAlert ? 'var(--red)' : 'var(--teal)',
        color: 'white',
      }}
      colorClass="ch-teal"
    >
      {/* Semáforo de Alertas */}
      <div
        style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 15 }}
      >
        {items.map(({ l, v, c }) => (
          <div
            key={l}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 7,
              border: `1.5px solid ${CLR[c]}`,
              background: `${CLR[c]}10`,
              fontFamily: 'var(--font-mono)',
              fontSize: '.85rem',
              fontWeight: 700,
              color: CLR[c],
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '.65rem',
                opacity: 0.8,
              }}
            >
              {l}
            </span>
            {v}
          </div>
        ))}
      </div>

      <SL>Constantes Vitales</SL>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
          marginBottom: 15,
        }}
      >
        {CAMPOS.map(({ key, label, ph, type }) => (
          <FieldGroup key={key} label={label}>
            <Input
              type={type || 'text'}
              placeholder={ph}
              value={state.vitales[key] || ''}
              onChange={(e) => set(key, e.target.value)}
              style={{ borderColor: getAlertColor(key), borderWidth: '1.5px' }}
              mono
            />
          </FieldGroup>
        ))}
      </div>

      <SL>Antropometría e IMC</SL>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 15,
        }}
      >
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {ANTROP.map(({ key, label, ph, type }) => (
            <FieldGroup key={key} label={label}>
              <Input
                type={type || 'text'}
                placeholder={ph}
                value={state.vitales[key] || ''}
                onChange={(e) => set(key, e.target.value)}
                mono
              />
            </FieldGroup>
          ))}
        </div>

        {/* Widget IMC Dinámico */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            display: imc.value ? 'block' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <div>
              <div
                style={{
                  fontSize: '.6rem',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                IMC
              </div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  lineHeight: 1,
                }}
              >
                {imc.value}
              </div>
              <div
                style={{
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: imc.color,
                  textTransform: 'uppercase',
                }}
              >
                {imc.label}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  marginTop: 8,
                  position: 'relative',
                  background:
                    'linear-gradient(90deg, #3182ce 0%, #276749 25%, #b7791f 55%, #c53030 100%)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -3,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: 'white',
                    border: `3px solid ${imc.color}`,
                    left: `${imc.pct}%`,
                    transform: 'translateX(-50%)',
                    transition: 'left 0.4s',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 5,
                  fontSize: '.55rem',
                  color: 'var(--muted)',
                }}
              >
                <span>BAJO</span>
                <span>NORMAL</span>
                <span>SOBRE</span>
                <span>OBESO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SL>Plan de Cuidados</SL>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldGroup label="Actividad / Movilización">
          <Input
            placeholder="Reposo absoluto / Deambulación asistida..."
            value={state.vitales.actividad || ''}
            onChange={(e) => set('actividad', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Dieta Indicada">
          <Input
            placeholder="NPO / Dieta blanda / Hiposódica..."
            value={state.vitales.dieta || ''}
            onChange={(e) => set('dieta', e.target.value)}
          />
        </FieldGroup>
      </div>

      {imc.alerta && (
        <div
          style={{
            marginTop: 10,
            padding: '10px',
            background: 'var(--red-l)',
            border: '1px solid var(--red-mid)',
            borderRadius: 8,
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--red)',
          }}
        >
          ⚠️ {imc.alerta}
        </div>
      )}
    </Card>
  );
}
