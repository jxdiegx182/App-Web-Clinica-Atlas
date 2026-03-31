// ══════════════════════════════════════════════════════
// SeccionFirma.jsx — MANFHER SYSTEMS · Atlas HIS
// Firma del Responsable — Firma Electrónica Certificada
// Equivalente exacto a SeccionFirma en Secciones.jsx
// ══════════════════════════════════════════════════════
import { useHCU } from '../store/hcuStore';
import { useQRGen, useUserSession } from '../hooks';
import { Card, FieldGroup, Input, Btn } from './UIComponents';

export default function SeccionFirma({ showToast }) {
  const { state, actions } = useHCU();
  const { firma }          = state;
  const { generate }       = useQRGen();
  const session            = useUserSession(firma);

  const set = (field) => (e) => actions.setFirmaCampos({ [field]: e.target.value });

  // Generar rectángulos del QR solo cuando está firmado
  const qrRects = firma.firmado && firma.hash ? generate(firma.hash, 54, 4) : [];

  return (
    <Card
      icon="✍️"
      title="Firma del Responsable de la Atención"
      colorClass="ch-navy"
    >

      {/* ── Campos de firma ── */}
      <div className="g3" style={{ marginBottom: 14 }}>
        <FieldGroup label="Médico Responsable">
          <Input
            id="firma-medico"
            value={firma.medico}
            onChange={set('medico')}
            placeholder="Dr. Apellido Nombre"
          />
        </FieldGroup>
        <FieldGroup label="Código / Matrícula SEN">
          <Input
            id="firma-codigo"
            value={firma.codigo}
            onChange={set('codigo')}
            placeholder="SEN-XXXX"
            mono
          />
        </FieldGroup>
        <FieldGroup label="Fecha y Hora de Registro">
          <Input
            id="firma-fecha"
            type="datetime-local"
            value={firma.fecha}
            onChange={set('fecha')}
          />
        </FieldGroup>
      </div>

      {/* ── Vista previa del certificado (antes de firmar) ── */}
      {!firma.firmado && (firma.medico || firma.codigo) && (
        <div style={{
          marginBottom: 14, padding: '10px 14px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 9, fontSize: '.75rem',
        }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
            Vista previa del certificado
          </div>
          <div style={{ color: 'var(--navy)', fontWeight: 700, marginBottom: 2 }}>
            {session.nombre || '—'}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--muted)', marginBottom: 4 }}>
            {session.cedula || '—'}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.68rem', color: 'var(--green)', fontWeight: 600 }}>
              ● {session.emisora}
            </span>
            <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>
              Válido hasta {session.validez}
            </span>
            <span style={{ fontSize: '.68rem', color: 'var(--dim)', fontFamily: "'JetBrains Mono',monospace" }}>
              {session.serie}
            </span>
          </div>
        </div>
      )}

      {/* ── Botón firmar (si no está firmado aún) ── */}
      {!firma.firmado && (
        <div style={{ marginBottom: 14 }}>
          <Btn
            variant="primary"
            onClick={() => window.dispatchEvent(new CustomEvent('atlas:openPinModal'))}
          >
            🔐 Firmar con PIN — Guardar Evolución
          </Btn>
          <div style={{ marginTop: 6, fontSize: '.65rem', color: 'var(--dim)' }}>
            Ley de Comercio Electrónico del Ecuador (Ley 2002-67) · Acuerdo MSP-00126-2021
          </div>
        </div>
      )}

      {/* ── Nodo auxiliar oculto para compatibilidad legacy ── */}
      <div id="print-firma-medico" style={{ display: 'none' }} />

      {/* ── Sello de firma digital ── */}
      {firma.firmado && (
        <div
          id="fe-sello"
          style={{
            marginTop: 14, padding: '16px 20px',
            background: 'var(--navy)', borderRadius: 12,
            boxShadow: '0 4px 18px rgba(15,36,64,.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

            {/* QR generado desde hash */}
            <div style={{ flexShrink: 0 }}>
              <svg
                width="54" height="54"
                viewBox="0 0 54 54"
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: 'white', borderRadius: 6, display: 'block' }}
              >
                <rect width="54" height="54" fill="white" />
                {qrRects.map((r, i) => (
                  <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
                ))}
              </svg>
            </div>

            {/* Datos del sello */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '.62rem', fontWeight: 800,
                color: 'var(--teal-mid)',
                textTransform: 'uppercase', letterSpacing: '.1em',
                marginBottom: 6,
              }}>
                ✅ Firmado Digitalmente — Firma Electrónica Certificada
              </div>

              <div
                id="fe-sello-detail"
                style={{
                  fontSize: '.72rem', color: 'rgba(255,255,255,.85)',
                  lineHeight: 1.8, fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {firma.medico} · {firma.codigo}<br />
                {session.emisora} · Serie: {firma.serie}<br />
                Hash: <span style={{ color: 'var(--teal-mid)', fontSize: '.66rem' }}>{firma.hash}</span>
              </div>

              <div
                id="fe-sello-ts"
                style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', marginTop: 6 }}
              >
                {firma.ts}
              </div>
            </div>

            {/* Validez del certificado */}
            <div style={{
              flexShrink: 0, padding: '6px 12px',
              background: 'rgba(39,103,73,.3)',
              border: '1px solid var(--green-mid)',
              borderRadius: 8, textAlign: 'center',
            }}>
              <div style={{ fontSize: '.56rem', color: 'var(--green-mid)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Válido hasta
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.72rem', color: 'var(--green-mid)', fontWeight: 700, marginTop: 2 }}>
                {session.validez}
              </div>
            </div>
          </div>

          {/* Banner de ley */}
          <div style={{
            marginTop: 12, padding: '6px 12px',
            background: 'rgba(255,255,255,.06)',
            borderRadius: 6, fontSize: '.6rem', color: 'rgba(255,255,255,.35)',
            textAlign: 'center',
          }}>
            Ley de Comercio Electrónico del Ecuador (Ley 2002-67) · Acuerdo MSP-00126-2021 ·
            Certificado emitido por {session.emisora}
          </div>
        </div>
      )}

      {/* ── Spans auxiliares para compatibilidad con USER_SESSION legacy ── */}
      <span id="fe-titular"    style={{ display: 'none' }}>{firma.medico}</span>
      <span id="fe-cedula-cert"style={{ display: 'none' }}>{firma.codigo}</span>
      <span id="fe-emisora"    style={{ display: 'none' }}>{session.emisora}</span>
      <span id="fe-validez"    style={{ display: 'none' }}>{session.validez}</span>
      <span id="fe-serie"      style={{ display: 'none' }}>{firma.serie}</span>
      <span id="fe-badge"      style={{ display: 'none' }} />
      <div  id="fe-status"     style={{ display: 'none' }} />
    </Card>
  );
}
