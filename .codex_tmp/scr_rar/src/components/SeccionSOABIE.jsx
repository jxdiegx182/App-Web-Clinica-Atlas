import { useHCU } from '../store/hcuStore';
import { Card, FieldGroup } from './UIComponents';                                                                                   
export default function SeccionSOABIE() {
  const { state, actions } = useHCU();
  const { soabie } = state;
  const set = (field) => (e) => actions.setSOABIE({ [field]: e.target.value });

  const items = [
    {
      key: 'subjetivo',
      letra: 'S',
      label: 'Subjetivo',
      color: '#3b82f6',
      bg: '#eff6ff',
      ph: 'Lo que el paciente refiere: dolor, síntomas, quejas...',
    },
    {
      key: 'objetivo',
      letra: 'O',
      label: 'Objetivo',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      ph: 'Hallazgos clínicos observados: exploración física...',
    },
    {
      key: 'analisis',
      letra: 'A',
      label: 'Análisis',
      color: 'var(--amber)',
      bg: 'var(--amber-l)',
      ph: 'Impresión diagnóstica, correlación clínica...',
    },
    {
      key: 'bienestar',
      letra: 'B',
      label: 'Bienestar',
      color: 'var(--teal-d)',
      bg: 'var(--teal-l)',
      ph: 'Estado emocional, nivel de dolor (EVA 0-10)...',
    },
    {
      key: 'intervenciones',
      letra: 'I',
      label: 'Intervenciones',
      color: 'var(--green)',
      bg: 'var(--green-l)',
      ph: 'Procedimientos realizados, curaciones...',
    },
    {
      key: 'evaluacion',
      letra: 'E',
      label: 'Evaluación / Plan',
      color: 'var(--red)',
      bg: 'var(--red-l)',
      ph: 'Respuesta al tratamiento, plan para próximas horas...',
    },
  ];

  return (
    <Card icon="📋" title="1. Evolución — Método SOABIE" colorClass="ch-teal">
      <div className="soabie-grid">
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              border: `1.5px solid ${item.color}`,
              borderRadius: 9,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '7px 12px',
                background: item.bg,
                color: item.color,
                fontSize: '.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{item.letra}</span> {item.label}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <textarea
                className="fta"
                id={`s-${item.key}`}
                value={soabie[item.key]}
                onChange={set(item.key)}
                placeholder={item.ph}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '4px 0',
                  fontSize: '.84rem',
                  resize: 'none',
                  minHeight: 80,
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="g2" style={{ marginTop: 12 }}>
        <FieldGroup label="Comunicar a Enfermería">
          <textarea
            className="fta"
            id="s-enfermeria"
            value={soabie.enfermeria}
            onChange={set('enfermeria')}
            placeholder="Indicaciones específicas para enfermería..."
            style={{ minHeight: 60 }}
          />
        </FieldGroup>
        <FieldGroup label="Observaciones Generales">
          <textarea
            className="fta"
            id="s-observaciones"
            value={soabie.observaciones}
            onChange={set('observaciones')}
            placeholder="Notas generales del equipo médico..."
            style={{ minHeight: 60 }}
          />
        </FieldGroup>
      </div>
    </Card>
  );
}
