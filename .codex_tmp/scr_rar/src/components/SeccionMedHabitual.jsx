// SeccionMedHabitual.jsx — MANFHER SYSTEMS · Atlas HIS
import { useState } from 'react';
import { useHCU } from '../store/hcuStore';
import { Card, SL, FieldGroup, Input } from './UIComponents';

export default function SeccionMedHabitual() {
  const { state, actions } = useHCU();
  const [frm, setFrm] = useState({ nom: '', dosis: '', frec: '', obs: '' });

  const agregar = () => {
    if (!frm.nom.trim()) return;
    actions.addMedHab(frm);
    setFrm({ nom: '', dosis: '', frec: '', obs: '' });
  };

  return (
    <Card icon="💊" title="Medicación Habitual (Crónica)" badge={state.medHabitual.length} colorClass="ch-navy">
      <SL>Medicación previa al ingreso</SL>

      {/* Lista */}
      {state.medHabitual.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {state.medHabitual.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderBottom: '1px solid var(--surface2)', fontSize: '.78rem',
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{m.nom}</span>
                {m.dosis && <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{m.dosis}</span>}
                {m.frec  && <span style={{ color: 'var(--muted)', marginLeft: 8 }}>· {m.frec}</span>}
                {m.obs   && <span style={{ color: 'var(--dim)',   marginLeft: 8, fontStyle: 'italic' }}>({m.obs})</span>}
              </div>
              <button onClick={() => actions.removeMedHab(m.id)}
                style={{ width: 24, height: 24, background: 'var(--red-l)', border: '1px solid var(--red-mid)', color: 'var(--red)', borderRadius: 5, cursor: 'pointer', fontSize: '.75rem' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: 8, alignItems: 'flex-end' }}>
        <FieldGroup label="Medicamento *"><Input value={frm.nom}  onChange={e => setFrm(f => ({ ...f, nom:  e.target.value }))} placeholder="Nombre comercial o genérico" /></FieldGroup>
        <FieldGroup label="Dosis">       <Input value={frm.dosis} onChange={e => setFrm(f => ({ ...f, dosis: e.target.value }))} placeholder="500mg" mono /></FieldGroup>
        <FieldGroup label="Frecuencia">  <Input value={frm.frec}  onChange={e => setFrm(f => ({ ...f, frec:  e.target.value }))} placeholder="Cada 8h" /></FieldGroup>
        <FieldGroup label="Observación"> <Input value={frm.obs}   onChange={e => setFrm(f => ({ ...f, obs:   e.target.value }))} placeholder="Indicación, prescriptor..." /></FieldGroup>
        <button onClick={agregar} style={{ padding: '7px 16px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', marginBottom: 1 }}>
          + Agregar
        </button>
      </div>
    </Card>
  );
}


