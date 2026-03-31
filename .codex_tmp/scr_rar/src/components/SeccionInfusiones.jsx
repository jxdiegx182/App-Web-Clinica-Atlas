// SeccionInfusiones.jsx — MANFHER SYSTEMS · Atlas HIS
import { useHCU } from '../store/hcuStore';
import { Card, SL, FieldGroup, Input, Select } from './UIComponents';

const VIAS = ['IV periférica', 'IV central', 'SC', 'SNG', 'Oral'];
const ESTADOS_INF = ['prog', 'corriendo', 'pausada', 'finalizada'];
const EST_CLR = { prog: 'var(--muted)', corriendo: 'var(--green)', pausada: 'var(--amber)', finalizada: 'var(--navy)' };

export default function SeccionInfusiones() {
  const { state, actions } = useHCU();
  const { infusiones } = state;

  const upd = (id, field, val) => actions.updateInf(id, { [field]: val });

  return (
    <Card icon="💧" title="Infusiones IV" badge={infusiones.length} colorClass="ch-blue">

      {infusiones.length === 0 ? (
        <p style={{ fontSize: '.8rem', color: 'var(--dim)', fontStyle: 'italic', margin: '8px 0' }}>
          Sin infusiones registradas — agregue con el botón inferior.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.77rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))' }}>
                {['Solución', 'Vol (ml)', 'Vel (ml/h)', 'Aditivo', 'Vía', 'Inicio', 'Duración', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', color: 'white', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {infusiones.map(inf => (
                <tr key={inf.id} style={{ borderBottom: '1px solid var(--surface2)' }}>
                  <td style={{ padding: '6px 8px' }}><Input value={inf.sol || ''} onChange={e => upd(inf.id, 'sol', e.target.value)} placeholder="Solución..." /></td>
                  <td style={{ padding: '6px 8px' }}><Input value={inf.vol || ''} onChange={e => upd(inf.id, 'vol', e.target.value)} placeholder="500" mono style={{ width: 70 }} /></td>
                  <td style={{ padding: '6px 8px' }}><Input value={inf.vel || ''} onChange={e => upd(inf.id, 'vel', e.target.value)} placeholder="42" mono style={{ width: 70 }} /></td>
                  <td style={{ padding: '6px 8px' }}><Input value={inf.adit || ''} onChange={e => upd(inf.id, 'adit', e.target.value)} placeholder="KCl, etc." /></td>
                  <td style={{ padding: '6px 8px' }}>
                    <Select value={inf.via || 'IV periférica'} onChange={e => upd(inf.id, 'via', e.target.value)} style={{ minWidth: 120 }}>
                      {VIAS.map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </td>
                  <td style={{ padding: '6px 8px' }}><Input type="time" value={inf.inicio || ''} onChange={e => upd(inf.id, 'inicio', e.target.value)} mono style={{ width: 90 }} /></td>
                  <td style={{ padding: '6px 8px' }}><Input value={inf.dur || ''} onChange={e => upd(inf.id, 'dur', e.target.value)} placeholder="12h" mono style={{ width: 60 }} /></td>
                  <td style={{ padding: '6px 8px' }}>
                    <Select value={inf.estado || 'prog'} onChange={e => upd(inf.id, 'estado', e.target.value)}
                      style={{ color: EST_CLR[inf.estado] || 'var(--muted)', fontWeight: 700, minWidth: 110 }}>
                      {ESTADOS_INF.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <button onClick={() => actions.removeInf(inf.id)}
                      style={{ width: 26, height: 26, background: 'var(--red-l)', border: '1px solid var(--red-mid)', color: 'var(--red)', borderRadius: 5, cursor: 'pointer', fontSize: '.8rem' }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={() => actions.addInf({})} style={{
        marginTop: 10, padding: '7px 16px', background: 'var(--blue)', color: 'white',
        border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
      }}>
        + Agregar Infusión
      </button>
    </Card>
  );
}
