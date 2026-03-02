import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

const RegistroInfusiones = () => {
  // --- Estados para las tablas ---
  const [agents, setAgents] = useState([
    { id: 1, name: 'Oxígeno por cánula nasal', time: '08:00' },
    { id: 2, name: 'Vasopresor (Norepinefrina)', time: '09:00' }
  ]);

  const [drugs, setDrugs] = useState([
    { id: 1, name: 'Ceftriaxona', dose: '1', unit: 'g IV c/12h', time: '10:00' },
    { id: 2, name: 'Metamizol', dose: '500', unit: 'mg IV c/8h', time: '12:00' },
    { id: 3, name: 'Midazolam', dose: '0.05', unit: 'mg/kg/h', time: '14:00' }
  ]);

  const [ingresos, setIngresos] = useState([
    { id: 1, label: 'SSN 0.9% 500 ml', time: '08:00', cc: 500 },
    { id: 2, label: 'Nutrición parenteral', time: '10:00', cc: 1000 },
    { id: 3, label: 'Diluyente de medicamentos', time: '11:00', cc: 150 }
  ]);

  const [egresos, setEgresos] = useState([
    { id: 1, label: 'Diuresis', time: '15:00', cc: 800 },
    { id: 2, label: 'Drenaje torácico', time: '16:00', cc: 200 }
  ]);

  // --- Helpers ---
  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const fmt = (n) => `${(Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString('es-ES')} cc`;

  // --- Cálculos ---
  const totalIngresos = ingresos.reduce((sum, item) => sum + (Number(item.cc) || 0), 0);
  const totalEgresos = egresos.reduce((sum, item) => sum + (Number(item.cc) || 0), 0);
  const balance = totalIngresos - totalEgresos;

  // --- Handlers ---
  const addRow = (type) => {
    const newId = Date.now();
    const time = nowTime();
    if (type === 'agent') setAgents([...agents, { id: newId, name: '', time }]);
    if (type === 'drug') setDrugs([...drugs, { id: newId, name: '', dose: '', unit: '', time }]);
    if (type === 'ingreso') setIngresos([...ingresos, { id: newId, label: '', time, cc: '' }]);
    if (type === 'egreso') setEgresos([...egresos, { id: newId, label: '', time, cc: '' }]);
  };

  const updateItem = (setter, state, id, field, value) => {
    setter(state.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter, state, id) => {
    setter(state.filter(item => item.id !== id));
  };

  return (
    <div style={styles.body}>
      <h1 style={styles.h1}>Formato interactivo: Agentes, Fármacos, Infusiones (Ingresos) y Egresos</h1>

      <div style={styles.grid}>
        
        {/* AGENTES */}
        <section style={styles.card}>
          <h2 style={styles.h2}>AGENTES</h2>
          <div style={styles.rowActions}>
            <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => addRow('agent')}>+ Agregar agente</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={{...styles.th, ...styles.thTime}}>Hora ingreso</th>
                <th style={{...styles.th, ...styles.right, width: '80px'}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(item => (
                <tr key={item.id}>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.name} onChange={(e) => updateItem(setAgents, agents, item.id, 'name', e.target.value)} placeholder="Ej: Oxígeno" /></td>
                  <td style={styles.td}><Input style={styles.inputTime} type="time" value={item.time} onChange={(e) => updateItem(setAgents, agents, item.id, 'time', e.target.value)} /></td>
                  <td style={{...styles.td, ...styles.right}}><button style={{...styles.btn, ...styles.btnDanger}} onClick={() => removeItem(setAgents, agents, item.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.note}>Ejemplo: "Oxígeno", "Vasopresor", "Inotrópico", etc.</div>
        </section>

        {/* FÁRMACOS */}
        <section style={styles.card}>
          <h2 style={styles.h2}>FÁRMACOS</h2>
          <div style={styles.rowActions}>
            <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => addRow('drug')}>+ Agregar fármaco</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Dosis</th>
                <th style={styles.th}>Unidad</th>
                <th style={{...styles.th, ...styles.thTime}}>Hora</th>
                <th style={{...styles.th, ...styles.right, width: '80px'}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map(item => (
                <tr key={item.id}>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.name} onChange={(e) => updateItem(setDrugs, drugs, item.id, 'name', e.target.value)} /></td>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.dose} onChange={(e) => updateItem(setDrugs, drugs, item.id, 'dose', e.target.value)} /></td>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.unit} onChange={(e) => updateItem(setDrugs, drugs, item.id, 'unit', e.target.value)} /></td>
                  <td style={styles.td}><Input style={styles.inputTime} type="time" value={item.time} onChange={(e) => updateItem(setDrugs, drugs, item.id, 'time', e.target.value)} /></td>
                  <td style={{...styles.td, ...styles.right}}><button style={{...styles.btn, ...styles.btnDanger}} onClick={() => removeItem(setDrugs, drugs, item.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* INFUSIONES Y EGRESOS */}
        <section style={styles.card}>
          <h2 style={styles.h2}>INFUSIONES (INGRESOS) y EGRESOS</h2>
          <div style={{...styles.rowActions, margin: '6px 0 10px'}}>
            <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => addRow('ingreso')}>+ Agregar ingreso</button>
            <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => addRow('egreso')}>+ Agregar egreso</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ingresos</th>
                <th style={{...styles.th, ...styles.thTime}}>Hora</th>
                <th style={{...styles.th, ...styles.right, width: '90px'}}>CC</th>
                <th style={{...styles.th, ...styles.right, width: '80px'}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map(item => (
                <tr key={item.id}>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.label} onChange={(e) => updateItem(setIngresos, ingresos, item.id, 'label', e.target.value)} /></td>
                  <td style={styles.td}><Input style={styles.inputTime} type="time" value={item.time} onChange={(e) => updateItem(setIngresos, ingresos, item.id, 'time', e.target.value)} /></td>
                  <td style={styles.td}><Input style={{...styles.input, textAlign: 'right'}} type="number" value={item.cc} onChange={(e) => updateItem(setIngresos, ingresos, item.id, 'cc', e.target.value)} /></td>
                  <td style={{...styles.td, ...styles.right}}><button style={{...styles.btn, ...styles.btnDanger}} onClick={() => removeItem(setIngresos, ingresos, item.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{height: '20px'}}></div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Egresos</th>
                <th style={{...styles.th, ...styles.thTime}}>Hora</th>
                <th style={{...styles.th, ...styles.right, width: '90px'}}>CC</th>
                <th style={{...styles.th, ...styles.right, width: '80px'}}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {egresos.map(item => (
                <tr key={item.id}>
                  <td style={styles.td}><Input style={styles.input} type="text" value={item.label} onChange={(e) => updateItem(setEgresos, egresos, item.id, 'label', e.target.value)} /></td>
                  <td style={styles.td}><Input style={styles.inputTime} type="time" value={item.time} onChange={(e) => updateItem(setEgresos, egresos, item.id, 'time', e.target.value)} /></td>
                  <td style={styles.td}><Input style={{...styles.input, textAlign: 'right'}} type="number" value={item.cc} onChange={(e) => updateItem(setEgresos, egresos, item.id, 'cc', e.target.value)} /></td>
                  <td style={{...styles.td, ...styles.right}}><button style={{...styles.btn, ...styles.btnDanger}} onClick={() => removeItem(setEgresos, egresos, item.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.totals}>
            <div style={styles.pill}><span style={styles.pillLabel}>TOTAL INGRESOS</span><span style={styles.pillValue}>{fmt(totalIngresos)}</span></div>
            <div style={styles.pill}><span style={styles.pillLabel}>TOTAL EGRESOS</span><span style={styles.pillValue}>{fmt(totalEgresos)}</span></div>
            <div style={styles.pill}>
              <span style={styles.pillLabel}>BALANCE</span>
              <span style={{...styles.pillValue, color: balance > 0 ? '#19c37d' : balance < 0 ? '#ff6b6b' : '#f4c542'}}>{fmt(balance)}</span>
            </div>
          </div>
          <div id="ai-panel" className="expanded">
  <div id="ai-header">
    <div className="ai-icon">🤖</div>
    <div className="ai-title">Asistente IA — Anestesia</div>
    <div className="ai-badge" id="ai-badge">
      0
    </div>
    <div className="toggle-icon">▲</div>
  </div>
  <div id="ai-body">
    <div id="ai-messages" />
    <button id="ai-analyze-btn" type="button">
      🔍 Analizar hoja completa
    </button>
    <div id="ai-input-row">
      <Input
        id="ai-input"
        type="text"
        placeholder="Pregunta al asistente… (Ej: ¿El balance es correcto?)"
      />
      <button id="ai-send" type="button">
        Enviar
      </button>
    </div>
  </div>
</div>
        </section>

                

      </div>
    </div>
  );
};

// --- Estilos ---
const styles = {
  body: {
    backgroundColor: '#0b4f6c',
    backgroundImage:  'linear-gradient(135deg, #0b4f6c 0%, #0b4f6c 50%, #0d2137 100%)',
    color: '#eaf1ff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Montserrat'
  },
  h1: { fontSize: '18px', margin: '0 0 12px', textAlign: 'center' },
  h2: { fontSize: '12px', margin: '0 0 10px', color: '#ffffff', fontWeight: '800', letterSpacing: '.4px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '9px' },
  card: {
    background: 'radial-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))',
    border: '1px solid #24345c',
    borderRadius: '14px',
    padding: '15px',
    boxShadow: '0 10px 10px rgba(0,0,0,.45)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', color: '#9fb0d0', padding: '1px', borderBottom: '1px solid #ffffff', background: 'rgba(255,255,255,.19)' },
  td: { padding: '3px 1px', borderBottom: '1px solid rgba(255,255,255,.15)' },
  input: { width: '100%', background: '#ffffff', color: '#000000', border: '1px solid rgba(34,49,85,.9)', borderRadius: '15px', padding: '8px 6px', outline: 'none',  fontSize: '12px' },
  inputTime: { width: '100%', background: '#418A9C', color: '#ffffff', border: '1px solid rgba(34,49,85,.9)', borderRadius: '20px', padding: '8px 10px', colorScheme: 'light',  fontSize: '13px' },
  btn: { padding: '8px 14px', borderRadius: '20px', border: '1px solid #ffffff', background: 'rgba(255,255,255,0.05)', borderRadius: '90px', padding: '8px 10px', cursor: 'pointer' },
  btnPrimary: { borderColor: 'rgba(122,162,255,.65)', background: 'rgba(122,162,255,.12)' },
  btnDanger: { borderColor: 'rgba(255,107,107,.9)', background: 'rgba(255,107,107,.29)', color: '#FAB9B9'  },
  rowActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '10px' },
  totals: { display: 'grid', gap: '10px', marginTop: '12px' },
  pill: { border: '1px solid #223155', borderRadius: '12px', padding: '10px 12px', background: 'rgba(255,255,255,.02)', display: 'flex', justifyContent: 'space-between' },
  pillLabel: { color: '#ffffff', fontSize: '12px' },
  pillValue: { fontWeight: '700' },
  note: { marginTop: '12px', fontSize: '12px', color: '#9fb0d0' },
  right: { textAlign: 'right' },
  thTime: { width: '96px' }
};

export default RegistroInfusiones;