import React from 'react';
import { SN } from '../data/parteOperatorioData';
import { h12 } from '../utils/parteOperatorioUtils';

const RecordatoriosSection = ({
  cxDelDia,
  enviarWA,
  enviarEmail,
  msgPac,
  msgDr,
  showToast,
}) => (
  <div className="rec-card" style={{ marginTop: '16px' }}>
    <div className="card-hdr" style={{ background: 'linear-gradient(135deg,#553c9a,#44337a)' }}>
      <div className="chi">🔔</div>
      <span className="cht">Recordatorios a Pacientes y Médicos</span>
      <span className="ia-badge" style={{ marginLeft: '8px' }}>🤖 IA v2</span>
    </div>
    <div>
      {cxDelDia.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--dim)', fontSize: '.8rem', fontStyle: 'italic' }}>Sin cirugías registradas para hoy</div>
      ) : (
        cxDelDia.map((r) => (
          <React.Fragment key={r.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--surface2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                  {r.nom} <span style={{ fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>— Paciente</span>
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.cir} · {h12(r.hora)} · {SN[r.sala]}</div>
                <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '.7rem', color: 'var(--navy)', marginTop: 3 }}>📞 {r.tel_pac || 'Sin teléfono'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {r.tel_pac
                  ? <button onClick={() => enviarWA(r.tel_pac, msgPac(r))} style={{ background: '#25d36622', border: '1px solid #25d36650', color: '#128c7e', padding: '4px 10px', borderRadius: '100px', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}>💬 WhatsApp</button>
                  : <span style={{ fontSize: '.68rem', color: 'var(--dim)' }}>Sin teléfono</span>
                }
                <button onClick={() => enviarEmail(r.email_pac, 'Recordatorio Cirugía - Clínicas Atlas', msgPac(r))}
                  style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '.68rem', cursor: 'pointer' }}>✉️ Email</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--surface2)', background: 'var(--navy-l)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍⚕️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                  {r.dr} <span style={{ fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>— Cirujano</span>
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.cir} · {r.nom} · {h12(r.hora)}</div>
                <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '.7rem', color: 'var(--navy)', marginTop: 3 }}>📞 {r.tel_dr || 'Sin teléfono'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {r.tel_dr
                  ? <button onClick={() => enviarWA(r.tel_dr, msgDr(r))} style={{ background: '#25d36622', border: '1px solid #25d36650', color: '#128c7e', padding: '4px 10px', borderRadius: '100px', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}>💬 WhatsApp</button>
                  : <span style={{ fontSize: '.68rem', color: 'var(--dim)' }}>Sin teléfono</span>
                }
                <button onClick={() => enviarEmail(r.email_dr, 'Recordatorio Cirugía - Clínicas Atlas', msgDr(r))}
                  style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '.68rem', cursor: 'pointer' }}>✉️ Email</button>
              </div>
            </div>
          </React.Fragment>
        ))
      )}
    </div>
    <div style={{ padding: '12px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', fontSize: '.74rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>🤖</span>
      <span>En la <strong>Versión 2</strong> la IA redactará mensajes personalizados y los enviará automáticamente.</span>
      <button onClick={() => showToast('🤖 IA v2: Esta función estará disponible en la próxima versión')}
        style={{ marginLeft: 'auto', padding: '6px 14px', background: '#553c9a', color: 'white', border: 'none', borderRadius: 7, fontSize: '.74rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        🔔 Generar Todos
      </button>
    </div>
  </div>
);

export default RecordatoriosSection;
