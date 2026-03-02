import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { motion } from "framer-motion";

const RegistroAnestesico = () => {
  // --- Estados del Formulario ---
  const [formData, setFormData] = useState({
    general_tiva: false,
    general_balanceada: false,
    manejo_via_aerea: '',
    monitoreo: '',
    cond_raquidea: false,
    cond_epidural: false,
    cond_simple: false,
    cond_continua: false,
    altura_puncion: '',
    aguja: '',
    baricidad: '',
    bloqueo_realizado: false,
    bloqueo_nervio_periferico: '',
    apgar_1: '',
    apgar_5: '',
    apgar_10: '',
    feto_muerto: '',
    complicaciones_operatorias: '',
    comentarios: '',
    otros: ''
  });

  const [positions, setPositions] = useState([
    { id: Date.now(), pos: 'Supino', ini: '', fin: '', notes: '' }
  ]);

  const [saveState, setSaveState] = useState({ text: 'No guardado', color: '#eaf1ff' });
  const [isDirty, setIsDirty] = useState(false);

  // --- Opciones de Posición ---
  const POS_OPTIONS = [
    'Supino', 'Prono', 'Decúbito lateral izquierdo', 'Decúbito lateral derecho',
    'Litotomía', 'Trendelenburg', 'Anti-Trendelenburg', 'Sentado',
    'Fowler / Semi-Fowler', 'Genupectoral', 'Otro (especificar en notas)'
  ];

  // --- Lógica de Activación (Memorizada) ---
  const isGeneralActive = useMemo(() => formData.general_tiva || formData.general_balanceada, [formData]);
  const isConductivaActive = useMemo(() => formData.cond_raquidea || formData.cond_epidural, [formData]);
  const isBloqueoActive = useMemo(() => formData.bloqueo_realizado, [formData]);

  // --- Cálculos de Tiempo ---
  const parseTimeToMinutes = (t) => {
    if (!t || !t.includes(':')) return null;
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + mm;
  };

  const positionsWithDuration = useMemo(() => {
    let totalMinutes = 0;
    const processed = positions.map(p => {
      const iniM = parseTimeToMinutes(p.ini);
      const finM = parseTimeToMinutes(p.fin);
      let dur = null;
      if (iniM !== null && finM !== null) {
        dur = finM >= iniM ? (finM - iniM) : (finM + 1440 - iniM);
        totalMinutes += dur;
      }
      return { ...p, dur };
    });
    return { list: processed, total: totalMinutes };
  }, [positions]);

  // --- Handlers de Eventos ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    markDirty();
  };

  const markDirty = () => {
    if (!isDirty) {
      setIsDirty(true);
      setSaveState({ text: 'Modificado (sin guardar)', color: '#ff6b6b' });
    }
  };

  const addPosition = () => {
    setPositions([...positions, { id: Date.now(), pos: 'Supino', ini: '', fin: '', notes: '' }]);
    markDirty();
  };

  const updatePosition = (id, field, value) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
    markDirty();
  };

  const removePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
    markDirty();
  };

  // --- Acciones de Persistencia ---
  const saveToLocal = () => {
    const payload = { formData, positions, savedAt: new Date().toISOString() };
    localStorage.setItem('registro_anestesico_react', JSON.stringify(payload));
    setSaveState({ text: `Guardado: ${new Date().toLocaleTimeString()}`, color: '#19c37d' });
    setIsDirty(false);
  };

  const loadFromLocal = () => {
    const raw = localStorage.getItem('registro_anestesico_react');
    if (raw) {
      const { formData, positions } = JSON.parse(raw);
      setFormData(formData);
      setPositions(positions);
      setSaveState({ text: 'Cargado de este dispositivo', color: '#7aa2ff' });
      setIsDirty(false);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify({ formData, positions }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registro_anestesico.json';
    link.click();
  };

  const animations = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  `;

  return (
    <motion.div
  style={styles.body}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
    <div style={styles.body}>
      <header>
        <h1 style={styles.h1}>Formato web interactivo </h1>
        <p style={styles.sub}>Activación dinámica por técnica y registro de posiciones transoperatorias.</p>
      </header>



      <div style={styles.grid}>
        {/* COLUMNA 1: GENERAL */}
        <section style={styles.card}>
          <h2 style={styles.cardH2}>Técnica (General)</h2>
          <label style={styles.label}>GENERAL</label>
          <div style={styles.checks}>
            <label style={styles.checkItem}>
              <input type="checkbox" name="general_tiva" checked={formData.general_tiva} onChange={handleInputChange} /> TIVA
            </label>
            <label style={styles.checkItem}>
              <input type="checkbox" name="general_balanceada" checked={formData.general_balanceada} onChange={handleInputChange} /> Balanceada
            </label>
          </div>

          <div style={styles.divider}></div>

          <fieldset disabled={!isGeneralActive} style={styles.fieldset}>
            <label style={styles.label}>Manejo vía aérea</label>
            <Input 
              style={styles.textarea} 
              name="manejo_via_aerea" 
              value={formData.manejo_via_aerea} 
              onChange={handleInputChange} 
              placeholder="Ej: máscara laríngea, intubación..."
            />
            <div style={styles.divider}></div>
            <label style={styles.label}>Monitoreo</label>
            <Input 
              style={styles.textarea} 
              name="monitoreo" 
              value={formData.monitoreo} 
              onChange={handleInputChange} 
              placeholder="ECG, SpO2, Capnografía..."
            />
          </fieldset>
          
          <div style={styles.pill}>
            <span style={styles.pillK}>Estado</span>
            <span style={{ ...styles.pillV, color: saveState.color }}>{saveState.text}</span>
          </div>
        </section>

        {/* COLUMNA 2: CONDUCTIVA */}
        <section style={styles.card}>
          <h2 style={styles.cardH2}>Técnica (Conductiva)</h2>
          <div style={styles.checks}>
            {['cond_raquidea', 'cond_epidural', 'cond_simple', 'cond_continua'].map(key => (
              <label key={key} style={styles.checkItem}>
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleInputChange} /> 
                {key.replace('cond_', '').charAt(0).toUpperCase() + key.slice(6)}
              </label>
            ))}
          </div>

          <div style={styles.divider}></div>

          <fieldset disabled={!isConductivaActive} style={styles.fieldset}>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Altura Punción</label>
                <Input style={styles.input} type="text" name="altura_puncion" value={formData.altura_puncion} onChange={handleInputChange} />
              </div>
              <div>
                <label style={styles.label}>Aguja</label>
                <Input style={styles.input} type="text" name="aguja" value={formData.aguja} onChange={handleInputChange} />
              </div>
            </div>
            <div style={styles.divider}></div>
            <label style={styles.label}>Baricidad</label>
            <div style={styles.checks}>
              {['isobara', 'hiperbara', 'no_especifica'].map(v => (
                <label key={v} style={styles.checkItem}>
                  <input type="radio" name="baricidad" value={v} checked={formData.baricidad === v} onChange={handleInputChange} /> {v}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* COLUMNA 3: BLOQUEO Y POSICIONES */}
        <section style={styles.card}>
          <h2 style={styles.cardH2}>Bloqueos y Posiciones</h2>
          <label style={styles.checkItem}>
            <input type="checkbox" name="bloqueo_realizado" checked={formData.bloqueo_realizado} onChange={handleInputChange} /> Bloqueo Nervio Periférico
          </label>
          <fieldset disabled={!isBloqueoActive} style={styles.fieldset}>
            <Input 
              style={{...styles.textarea, minHeight: '30px', marginTop: '4px'}} 
              name="bloqueo_nervio_periferico" 
              value={formData.bloqueo_nervio_periferico} 
              onChange={handleInputChange}
            />
          </fieldset>

          <div style={styles.divider}></div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px'}}>
             <h2 style={{...styles.cardH2, margin:0}}>Posiciones</h2>
             <button style={{...styles.btn, ...styles.btnPrimary}} onClick={addPosition}>+ Añadir</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Posición</th>
                <th style={styles.th}>Inicio/Fin</th>
                <th style={styles.th}>Dur</th>
                <th style={{...styles.th, textAlign: 'right'}}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {positionsWithDuration.list.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}>
                    <select style={styles.select} value={p.pos} onChange={(e) => updatePosition(p.id, 'pos', e.target.value)}>
                      {POS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input style={styles.inputTime} type="time" value={p.ini} onChange={(e) => updatePosition(p.id, 'ini', e.target.value)} />
                    <input style={styles.inputTime} type="time" value={p.fin} onChange={(e) => updatePosition(p.id, 'fin', e.target.value)} />
                  </td>
                  <td style={styles.td}>{p.dur ? `${p.dur}m` : '—'}</td>
                  <td style={{...styles.td, textAlign: 'right'}}>
                    <button style={{...styles.btn, ...styles.btnDanger}} onClick={() => removePosition(p.id)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.pill}>
            <span style={styles.pillK}>Total Posición</span>
            <span style={styles.pillV}>{positionsWithDuration.total} min</span>
          </div>
       
          <div style={styles.divider}></div>

      <h2 style={styles.cardH2}>APGAR</h2>
          <div style={styles.row3}>
            <div><label style={styles.label}>1 min</label><Input type="number" name="apgar_1" style={styles.input} value={formData.apgar_1} onChange={handleInputChange} min="0" max="10" /></div>
            <div><label style={styles.label}>5 min</label><Input type="number" name="apgar_5" style={styles.input} value={formData.apgar_5} onChange={handleInputChange} min="0" max="10" /></div>
            <div><label style={styles.label}>10 min</label><Input type="number" name="apgar_10" style={styles.input} value={formData.apgar_10} onChange={handleInputChange} min="0" max="10" /></div>
          </div>

          <div style={styles.divider}></div>
          <label style={styles.label}>Feto muerto</label>
          <div style={styles.checks}>
            {['si', 'no', 'no_aplica'].map(val => (
              <label key={val} style={styles.checkItem}>
                <input type="radio" name="feto_muerto" value={val} checked={formData.feto_muerto === val} onChange={handleInputChange} /> {val.replace('_', ' ')}
              </label>
            ))}
          </div>

          <div style={styles.divider}></div>
          <h2 style={styles.cardH2}>Complicaciones operatorias</h2>
          <Input name="complicaciones_operatorias" style={styles.textarea} value={formData.complicaciones_operatorias} onChange={handleInputChange} />

          <div style={styles.divider}></div>
          <h2 style={styles.cardH2}>Comentarios</h2>
          <Input name="comentarios" style={styles.textarea} value={formData.comentarios} onChange={handleInputChange} />

          <div style={styles.divider}></div>
          <h2 style={styles.cardH2}>Otros</h2>
          <Input name="otros" style={styles.textarea} value={formData.otros} onChange={handleInputChange} />
        </section>
      </div>












      <div style={styles.actions}>
        <button style={styles.btn} onClick={loadFromLocal}>Cargar</button>
        <button style={{...styles.btn, ...styles.btnPrimary}} onClick={saveToLocal}>Guardar Local</button>
        <button style={styles.btn} onClick={exportJSON}>Exportar JSON</button>
        <button style={styles.btn} onClick={() => window.print()}>Imprimir</button>
      </div>
    </div>
    </motion.div>
  );
};

// --- Objeto de Estilos (CSS-in-JS) ---
const styles = {
  body: {
    backgroundColor: '#0b4f6c',
    backgroundImage: 'radial-gradient(1200px 2990px at 15%, #0b4f6c 0%, #0b4f6c 50%, #0d2137 100%)',
    color: '#eaf1ff',
    background: 'linear-gradient(135deg, #0b4f6c 0%, #0b4f6c 50%, #0d2137 100%)',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Montserrat',
    animation: 'fadeInDown 0.8s ease',
  },
  h1: { fontSize: '18px', margin: '0 0 4px',textAlign: 'center', animation: 'fadeInUp 0.6s ease' },
  sub: { fontSize: '12px', color: '#a9b7d6', marginBottom: '20px', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(490px, 1fr))', gap: '40px' },
  card: {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05))',
    border: '1px solid #24345c',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,.25)',
    animation: 'fadeInUp 0.6s ease',
  },
  cardH2: { fontSize: '12px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px', gap: '10px' },
  fieldset: { border: 'none', padding: 0, margin: 0, transition: 'opacity 0.3s' },
  label: { display: 'block', fontSize: '11px', color: '#ffffff', marginBottom: '0.5px', textTransform: 'uppercase' },
  input: { width: '100%', background: '#ffffff', color: '#000000', border: '1px solid #24345c', borderRadius: '8px', padding: '8px', marginBottom: '10px' },
  inputTime: { width: '100%', background: '#ffffff', color: '#000000', border: '1px solid #24345c', borderRadius: '4px', padding: '2px 4px', fontSize: '12px', colorScheme: 'light' },
  textarea: { width: '100%',  background: 'rgba(255, 255, 255, 0.07)', color: '#ffffff', border: '1px solid #24345c', borderRadius: '18px', padding: '18px', minHeight: '20px', fontFamily: 'Montserrat' },
  select: { width: '100%', background: '#ffffff', color: '#0b4f6c', border: '1px solid #24345c', borderRadius: '6px', padding: '4px' },
  checks: { display: 'flex', flexWrap: 'wrap', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px dashed #24345c' },
  checkItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' },
  divider: { height: '1px', background: 'rgba(36,52,92,0.7)', margin: '15px 0' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', color: '#a9b7d6', padding: '8px', borderBottom: '1px solid #24345c' },
  td: { padding: '8px', borderBottom: '1px solid rgba(36,52,92,0.3)' },
  pill: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginTop: '12px', border: '1px solid #24345c' },
  pillK: { fontSize: '11px', color: '#a9b7d6' },
  pillV: { fontWeight: 'bold' },
  btn: { padding: '8px 14px', borderRadius: '20px', border: '1px solid #24345c', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '12px' },
  btnPrimary: { background: 'rgba(122,162,255,0.15)', borderColor: '#7aa2ff' },
  btnDanger: { color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },

  

};

export default RegistroAnestesico;