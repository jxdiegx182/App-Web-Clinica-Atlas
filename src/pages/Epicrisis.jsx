import React, { useState, useEffect } from 'react';
import { EpicrisisPDF } from '../components/EpicrisisPDF';
import { Button } from '@/components/ui/button';

const Epicrisis = () => {
  const [formData, setFormData] = useState({
    // Sección 1: Datos de Alta
    fechaAlta: '',
    horaAlta: '',
    discapacidad: '',
    defuncion: '',
    diasEstancia: '',
    diasIncapacidad: '',
    // Sección 3: Indicación
    indicacionAlta: '',
    condicionEgreso: '',
    pronostico: '',
  });

  const [diagnosticosIngreso, setDiagnosticosIngreso] = useState([]);
  const [diagnosticosEgreso, setDiagnosticosEgreso] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [defuncionVisible, setDefuncionVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  // Estados para modales
  const [modalDiagIngreso, setModalDiagIngreso] = useState(false);
  const [modalDiagEgreso, setModalDiagEgreso] = useState(false);
  const [modalMedico, setModalMedico] = useState(false);
  const [diagForm, setDiagForm] = useState({ codigo: '', diagnostico: '', presuntivo: true, definitivo: false, descripcion: '' });
  const [medicoForm, setMedicoForm] = useState({ nombre: '', especialidad: '', cedula: '' });

  // Inyectar estilos CSS
  useEffect(() => {
    const styles = `
      :root {
        --bg: #f0f4f8;
        --card: #ffffff;
        --border: #d1d5db;
        --text: #111827;
        --muted: #6b7280;
        --primary: #595759;
        --primary-dark: #76c4d5;
        --ok: #76C4D5;
        --warn: #f59e0b;
        --err: #ef4444;
        --chip: #eef2ff;
        --accent: #e8f0fe;
        --shadow: 0 2px 8px rgba(0,0,0,.08);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
        padding: 16px;
      }
      .container { max-width: 1100px; margin: 0 auto; }

      /* ── HEADER ── */
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: linear-gradient(205deg, #76c4d52f, #76c4d52b);
        border-radius: 12px;
        margin-bottom: 20px;
        color: #595759;
        box-shadow: var(--shadow);
      }
      header .logo { display: flex; align-items: center; gap: 12px; }
      header .logo-icon {
        width: 42px; height: 42px;
        background: rgba(78, 166, 133, 0.54);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
      }
      header h1 { font-size: 18px; font-weight: 700; }
      header .sub { font-size: 12px; opacity: 0.85; margin-top: 2px; }
      .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .live-badge {
        display: flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,0.15);
        padding: 6px 12px; border-radius: 999px;
        font-size: 12px; color: #575957;
      }
      .live-dot {
        width: 8px; height: 8px;
        background: #69C9BA;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* ── PROGRESS BAR ── */
      .progress-wrap {
        background: #76c4d5be;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 18px;
        box-shadow: var(--shadow);
      }
      .progress-header { display: flex; color: #595759; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
      .progress-bar-bg { background: #ffffff; border-radius: 999px; height: 8px; }
      .progress-bar-fill {
        background: linear-gradient(90deg, #1f6feb, #10b981);
        height: 8px; border-radius: 999px;
        transition: width 0.4s ease;
      }
      .progress-steps { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
      .step-chip {
        padding: 4px 10px; border-radius: 999px;
        font-size: 11px; cursor: pointer;
        border: 1px solid var(--border);
        background: #f9fafb;
        transition: all 0.2s;
        display: inline-block;
      }
      .step-chip.active { background: var(--primary); color: #fff; border-color: var(--primary); }
      .step-chip.done { background: var(--ok); color: #fff; border-color: var(--ok); }

      /* ── CARDS ── */
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: var(--shadow);
        transition: box-shadow 0.2s;
      }
      .card:hover { box-shadow: 0 4px 16px rgba(158, 40, 40, 0.1); }
      .card-header {
        display: flex;  justify-content: space-between;
        align-items: center; margin-bottom: 14px;
        padding-bottom: 10px; border-bottom: 2px solid var(--accent);
      }
      .card-title { display: flex; align-items: center; color: #ffffff; gap: 8px;  font-size: 15px; font-weight: 700; color: var(--primary); }
      .card-title .icon { font-size: 18px; }
      .card-badge {
      color: #ffffff;
        background: #4ea686c9;
        padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
      }

      /* ── FIELDS ── */
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
      .field { display: flex; flex-direction: column; gap: 5px; }
      label { font-weight: 600; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; }
      input[type="text"],
      input[type="number"],
      input[type="date"],
      input[type="time"],
      textarea,
      select {
        padding: 9px 12px;
        border: 1.5px solid var(--border);
        border-radius: 8px;
        font-size: 14px;
        background: #76c4d545;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;
        font-family: inherit;
      }
      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(31,111,235,0.12);
      }
      input.field-ok { border-color: var(--ok); }
      textarea { min-height: 70px; resize: vertical; }

      /* ── BUTTONS ── */
      .btn {
      
        display: inline-flex; align-items: center; gap: 6px;
        padding: 9px 16px; border: none; border-radius: 8px;
        cursor: pointer; font-size: 13px; font-weight: 600;
        transition: all 0.2s; text-decoration: none;
      }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
      .btn-success { background: var(--ok); color: #fff; }
      .btn-success:hover { background: #595759; transform: translateY(-1px); }
      .btn-danger { background: var(--err); color: #fff; }
      .btn-danger:hover { background: #dc2626; }
      .btn-secondary { background: #6b7280; color: #fff; }
      .btn-secondary:hover { background: #4b5563; }
      .btn-outline {
        background: transparent; color: var(--primary);
        border: 1.5px solid var(--primary);
      }
      .btn-outline:hover { background: var(--accent); }
      .btn-sm { padding: 5px 10px; font-size: 12px; }

      /* ── TABLES ── */
      .table-wrap { overflow-x: auto; margin-top: 8px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th {
        background:  #76c4d566;
        padding: 9px 10px; text-align: left;
        font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px;
        border-bottom: 2px solid var(--border);
      }
      td {
        padding: 7px 8px; border-bottom: 1px solid #f4f6f3;
        vertical-align: middle;
      }
      tr:last-child td { border-bottom: none; }
      tbody tr:hover { background: #fafafa; }
      .table-actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }

      /* ── MÉDICOS TRATANTES ── */
      .medicos-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
      .medico-card {
        background: var(--accent);
        border: 1.5px solid #154599;
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .medico-card .medico-header {
        display: flex; justify-content: space-between; align-items: center;
      }
      .medico-num {
        background: var(--primary); color: #fff;
        width: 26px; height: 26px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700;
      }
      .medico-card .medico-grid {
        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
      }
      .medico-preview {
        font-size: 12px; color: var(--primary); font-weight: 600;
        display: flex; align-items: center; gap: 4px;
      }

      /* ── RESUMEN CARD ── */
      .resumen-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;
      }
      .stat-box {
         background: #69c9bb44; border-radius: 10px;
        padding: 12px; text-align: center;
        border: 1px solid #4ea685;
      }
      .stat-box .stat-val { font-size: 24px;  font-weight: 700; color: var(--primary); }
      .stat-box .stat-lbl { font-size: 11px;  color: var(--muted); margin-top: 2px; }

      /* ── TOAST ── */
      .toast {
        position: fixed; bottom: 24px; right: 24px;
        background: #111; color: #fff;
        padding: 12px 20px; border-radius: 10px;
        font-size: 13px; opacity: 0; pointer-events: none;
        transition: opacity 0.3s; z-index: 9999;
        display: flex; align-items: center; gap: 8px;
      }
      .toast.show { opacity: 1; pointer-events: auto; }
      .toast.toast-ok { background: var(--ok); }
      .toast.toast-err { background: var(--err); }

      /* ── MODAL ── */
      .modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; opacity: 0; pointer-events: none;
        transition: opacity 0.2s;
      }
      .modal-overlay.open { opacity: 1; pointer-events: auto; }
      .modal {
        background: #fff; border-radius: 14px;
        padding: 24px; max-width: 460px; width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        transform: scale(0.9);
        transition: transform 0.2s;
      }
      .modal-overlay.open .modal { transform: scale(1); }
      .modal h3 { font-size: 16px; margin-bottom: 16px; color: var(--primary); }
      .modal-actions { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }

      /* ── SEPARADOR ── */
      .section-sep { display: flex; align-items: center; gap: 8px; margin: 6px 0 16px; }
      .section-sep span { font-size: 11px; color: var(--muted); white-space: nowrap; }
      .section-sep hr { flex: 1; border: none; border-top: 1px dashed var(--border); }

      /* ── ACTIONS BAR ── */
      .actions-bar {
        display: flex; gap: 10px; justify-content: flex-end;
        flex-wrap: wrap; padding: 16px 0;
      }

      @media (max-width: 900px) {
        .grid, .grid-3, .grid-4, .medico-card .medico-grid, .resumen-grid {
          grid-template-columns: 1fr;
        }
        .header-actions { flex-direction: column; align-items: flex-end; }
      }
      @media (max-width: 600px) {
        header { flex-direction: column; gap: 10px; text-align: center; }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => document.head.removeChild(styleSheet);
  }, []);

  // Actualizar progreso
  useEffect(() => {
    const campos = Object.values(formData).filter(v => v).length;
    const totalDiags = diagnosticosIngreso.length + diagnosticosEgreso.length;
    const totalMedicos = medicos.length;
    const totalCampos = 6 + 3 + totalDiags + totalMedicos;
    const porcentaje = totalCampos > 0 ? Math.round((campos / 15) * 100) : 0;
    setProgress(Math.min(porcentaje, 100));
  }, [formData, diagnosticosIngreso, diagnosticosEgreso, medicos]);

  // Manejadores
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDefuncion = () => {
    setDefuncionVisible(formData.defuncion === 'Si');
  };

  const showToast = (message, type = 'ok') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  const calcularDias = () => {
    if (formData.fechaAlta && formData.horaAlta) {
      const fecha = new Date(formData.fechaAlta);
      return Math.floor(Math.random() * 30) + 1; // Simulado
    }
    return '—';
  };

  const guardarFormulario = () => {
    showToast('Epicrisis guardada correctamente', 'ok');
  };

  const limpiarFormulario = () => {
    setFormData({
      fechaAlta: '', horaAlta: '', discapacidad: '', defuncion: '',
      diasEstancia: '', diasIncapacidad: '', indicacionAlta: '',
      condicionEgreso: '', pronostico: '',
    });
    setDiagnosticosIngreso([]);
    setDiagnosticosEgreso([]);
    setMedicos([]);
    showToast('Formulario limpiado', 'ok');
  };

  // Modales de diagnósticos
  const abrirModalDiag = (tipo) => {
    setDiagForm({ codigo: '', diagnostico: '', presuntivo: tipo === 'ingreso', definitivo: false, descripcion: '' });
    if (tipo === 'ingreso') setModalDiagIngreso(true);
    else setModalDiagEgreso(true);
  };

  const guardarDiag = (tipo) => {
    if (!diagForm.codigo || !diagForm.diagnostico) {
      alert('Código y diagnóstico son requeridos');
      return;
    }
    const newDiag = { id: Date.now(), ...diagForm };
    if (tipo === 'ingreso') {
      setDiagnosticosIngreso([...diagnosticosIngreso, newDiag]);
      setModalDiagIngreso(false);
    } else {
      setDiagnosticosEgreso([...diagnosticosEgreso, newDiag]);
      setModalDiagEgreso(false);
    }
    showToast('Diagnóstico agregado', 'ok');
  };

  const eliminarDiag = (id, tipo) => {
    if (tipo === 'ingreso') {
      setDiagnosticosIngreso(diagnosticosIngreso.filter(d => d.id !== id));
    } else {
      setDiagnosticosEgreso(diagnosticosEgreso.filter(d => d.id !== id));
    }
    showToast('Diagnóstico eliminado', 'ok');
  };

  const copiarDiagIngreso = () => {
    if (diagnosticosIngreso.length === 0) {
      alert('No hay diagnósticos para copiar');
      return;
    }
    const copiados = diagnosticosIngreso.map(d => ({ ...d, id: Date.now() + Math.random() }));
    setDiagnosticosEgreso([...diagnosticosEgreso, ...copiados]);
    showToast('Diagnósticos copiados', 'ok');
  };

  // Modales de médicos
  const abrirModalMedico = () => {
    setMedicoForm({ nombre: '', especialidad: '', cedula: '' });
    setModalMedico(true);
  };

  const guardarMedico = () => {
    if (!medicoForm.nombre || !medicoForm.especialidad) {
      alert('Nombre y especialidad son requeridos');
      return;
    }
    const newMedico = { id: Date.now(), ...medicoForm };
    setMedicos([...medicos, newMedico]);
    setModalMedico(false);
    showToast('Médico agregado', 'ok');
  };

  const eliminarMedico = (id) => {
    setMedicos(medicos.filter(m => m.id !== id));
    showToast('Médico eliminado', 'ok');
  };

  return (
    <div className="container">
      {/* HEADER */}
      <header>
        <div className="logo">
          <div className="logo-icon">🏥</div>
          <div>
            <h1>Epicrisis — Historia Clínica</h1>
            <div className="sub">MSP Ecuador · Proceso de alta y cierre de episodio</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="live-badge">
            <div className="live-dot"></div>
            <span>Guardado automático activo</span>
          </div>
          <button className="btn btn-outline" style={{ color: '#595759', borderColor: 'rgb(0, 0, 0)' }} onClick={limpiarFormulario}>
            🗑 Limpiar
          </button>


          <div className="flex justify-end">
            <Button
              onClick={async () => {
          
                  // 1️⃣ abrir pestaña vacía primero
                const newWindow = window.open("", "_blank");
                 // 2️⃣ generar PDF
                const pdfBytes = await EpicrisisPDF({
                  formData,
                });
                      // 3️⃣ crear blob
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                  // 4️⃣ cargar PDF en la nueva pestaña
                newWindow.location.href = url;
          
                 // 5️⃣ imprimir cuando cargue
                newWindow.onload = () => {
                  newWindow.print();
                };
          
              }}
              className="bg-[#76c4d5] hover:bg-teal-700 text-white px-6 py-2 rounded-2xl shadow-lg"
            >
              🖨️ Imprimir
            </Button>
          </div>
          

          
          <button className="btn btn-success" onClick={guardarFormulario}>
            💾 Guardar Epicrisis
          </button>
        </div>
      </header>

      {/* BARRA DE PROGRESO */}
      <div className="progress-wrap">
        <div className="progress-header">
          <span>📋 Progreso de llenado del formulario</span>
          <span>{progress}% completado</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-steps">
          <span className={`step-chip ${formData.fechaAlta ? 'done' : ''}`}>📅 Datos de alta</span>
          <span className={`step-chip ${diagnosticosIngreso.length > 0 ? 'done' : ''}`}>🔬 Diag. Ingreso</span>
          <span className={`step-chip ${diagnosticosEgreso.length > 0 ? 'done' : ''}`}>📤 Diag. Egreso</span>
          <span className={`step-chip ${formData.indicacionAlta ? 'done' : ''}`}>📝 Indicación</span>
          <span className={`step-chip ${medicos.length > 0 ? 'done' : ''}`}>👨‍⚕️ Médicos</span>
        </div>
      </div>

      {/* RESUMEN ESTADÍSTICO */}
      <div className="resumen-grid" style={{ marginBottom: '16px' }}>
        <div className="stat-box">
          <div className="stat-val">{formData.diasEstancia || '—'}</div>
          <div className="stat-lbl">Días de estancia</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{formData.diasIncapacidad || '—'}</div>
          <div className="stat-lbl">Días de incapacidad</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{diagnosticosIngreso.length + diagnosticosEgreso.length}</div>
          <div className="stat-lbl">Total diagnósticos</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{medicos.length}</div>
          <div className="stat-lbl">Médicos tratantes</div>
        </div>
      </div>

      <form autoComplete="off">
        {/* SECCIÓN 1: DATOS DE ALTA */}
        <section className="card" id="sec-alta">
          <div className="card-header">
            <div className="card-title"><span className="icon">📅</span> Datos de Alta</div>
            <span className="card-badge">Sección 1</span>
          </div>

          <div className="grid">
            <div className="field">
              <label>📆 Fecha de Alta</label>
              <input type="date" name="fechaAlta" value={formData.fechaAlta} onChange={handleInputChange} />
            </div>
            <div className="field">
              <label>⏰ Hora de Alta</label>
              <input type="time" name="horaAlta" value={formData.horaAlta} onChange={handleInputChange} />
            </div>
          </div>

          <div className="section-sep"><hr /><span>Información complementaria</span><hr /></div>

          <div className="grid-3">
            <div className="field">
              <label>♿ Discapacidad</label>
              <input type="text" name="discapacidad" value={formData.discapacidad} onChange={handleInputChange} placeholder="Ej: Física moderada 40%" />
            </div>
            <div className="field">
              <label>💀 Defunción</label>
              <select name="defuncion" value={formData.defuncion} onChange={(e) => { handleInputChange(e); setDefuncionVisible(e.target.value === 'Si'); }}>
                <option value="">— Seleccionar —</option>
                <option value="No">✅ No</option>
                <option value="Si">⚠️ Sí</option>
              </select>
            </div>
            <div className="field">
              <label>🛏 Días de Estancia</label>
              <input type="number" name="diasEstancia" value={formData.diasEstancia} onChange={handleInputChange} min="0" placeholder="0" />
            </div>
          </div>

          {defuncionVisible && (
            <div style={{ marginTop: '10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#991b1b' }}>
              ⚠️ <strong>Atención:</strong> Se ha marcado defunción. Por favor complete el certificado de defunción correspondiente.
            </div>
          )}

          <div className="grid" style={{ marginTop: '14px' }}>
            <div className="field">
              <label>📋 Días de Incapacidad</label>
              <input type="number" name="diasIncapacidad" value={formData.diasIncapacidad} onChange={handleInputChange} min="0" placeholder="0" />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: DIAGNÓSTICOS INGRESO */}
        <section className="card" id="sec-diag-ing">
          <div className="card-header">
            <div className="card-title"><span className="icon">🔬</span> Diagnósticos de Ingreso</div>
            <span className="card-badge">{diagnosticosIngreso.length} registros</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código CIE-10</th>
                  <th>Diagnóstico</th>
                  <th>Presuntivo</th>
                  <th>Definitivo</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticosIngreso.map((diag, idx) => (
                  <tr key={diag.id}>
                    <td>{idx + 1}</td>
                    <td>{diag.codigo}</td>
                    <td>{diag.diagnostico}</td>
                    <td>{diag.presuntivo ? '✓' : '—'}</td>
                    <td>{diag.definitivo ? '✓' : '—'}</td>
                    <td>{diag.descripcion}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => eliminarDiag(diag.id, 'ingreso')}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-actions">
            <button type="button" className="btn btn-primary" onClick={() => abrirModalDiag('ingreso')}>
              ➕ Agregar diagnóstico de ingreso
            </button>
            <span style={{ fontSize: '12px', color: 'var(--muted)', alignSelf: 'center' }}>
              💡 Código CIE-10 recomendado (ej: J18.9)
            </span>
          </div>
        </section>

        {/* SECCIÓN 3: DIAGNÓSTICOS EGRESO */}
        <section className="card" id="sec-diag-eg">
          <div className="card-header">
            <div className="card-title"><span className="icon">📤</span> Diagnósticos de Egreso</div>
            <span className="card-badge">{diagnosticosEgreso.length} registros</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código CIE-10</th>
                  <th>Diagnóstico</th>
                  <th>Presuntivo</th>
                  <th>Definitivo</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticosEgreso.map((diag, idx) => (
                  <tr key={diag.id}>
                    <td>{idx + 1}</td>
                    <td>{diag.codigo}</td>
                    <td>{diag.diagnostico}</td>
                    <td>{diag.presuntivo ? '✓' : '—'}</td>
                    <td>{diag.definitivo ? '✓' : '—'}</td>
                    <td>{diag.descripcion}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => eliminarDiag(diag.id, 'egreso')}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-actions">
            <button type="button" className="btn btn-primary" onClick={() => abrirModalDiag('egreso')}>
              ➕ Agregar diagnóstico de egreso
            </button>
            <button type="button" className="btn btn-outline" onClick={copiarDiagIngreso}>
              📋 Copiar desde ingreso
            </button>
          </div>
        </section>

        {/* SECCIÓN 4: INDICACIÓN DE ALTA */}
        <section className="card" id="sec-indicacion">
          <div className="card-header">
            <div className="card-title"><span className="icon">📝</span> Indicación de Alta / Egreso</div>
            <span className="card-badge">Sección 4</span>
          </div>

          <div className="field">
            <label>📋 Indicaciones al alta</label>
            <textarea name="indicacionAlta" value={formData.indicacionAlta} onChange={handleInputChange} placeholder="Plan de alta, indicaciones médicas, medicación domiciliaria..." style={{ minHeight: '90px' }}></textarea>
          </div>

          <div className="grid" style={{ marginTop: '14px' }}>
            <div className="field">
              <label>🩺 Condición de Egreso</label>
              <select name="condicionEgreso" value={formData.condicionEgreso} onChange={handleInputChange}>
                <option value="">— Seleccione condición —</option>
                <option value="Curado">✅ Curado</option>
                <option value="Mejorado">📈 Mejorado</option>
                <option value="Sin cambio">➡️ Sin cambio</option>
                <option value="Deteriorado">📉 Deteriorado</option>
                <option value="Fallecido">💀 Fallecido</option>
                <option value="Transferido">🚑 Transferido</option>
              </select>
            </div>
            <div className="field">
              <label>🔮 Detalle del Pronóstico</label>
              <input type="text" name="pronostico" value={formData.pronostico} onChange={handleInputChange} placeholder="Ej: Bueno, reservado, favorable..." />
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: MÉDICOS TRATANTES */}
        <section className="card" id="sec-medicos">
          <div className="card-header">
            <div className="card-title"><span className="icon">👨‍⚕️</span> Médicos Tratantes</div>
            <span className="card-badge">{medicos.length} médicos</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>
            Agregue todos los profesionales de la salud que participaron en la atención del paciente durante su hospitalización.
          </p>

          <div className="medicos-list">
            {medicos.map((medico, idx) => (
              <div key={medico.id} className="medico-card">
                <div className="medico-header">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>{medico.nombre}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{medico.especialidad}</div>
                    {medico.cedula && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Cédula: {medico.cedula}</div>}
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarMedico(medico.id)}>❌</button>
                </div>
              </div>
            ))}
          </div>

          <div className="table-actions">
            <button type="button" className="btn btn-primary" onClick={abrirModalMedico}>
              ➕ Agregar médico tratante
            </button>
          </div>
        </section>
      </form>

      {/* MODAL DIAGNÓSTICO INGRESO */}
      <div className={`modal-overlay ${modalDiagIngreso ? 'open' : ''}`}>
        <div className="modal">
          <h3>Agregar Diagnóstico de Ingreso</h3>
          <div className="field">
            <label>Código CIE-10</label>
            <input type="text" value={diagForm.codigo} onChange={(e) => setDiagForm({ ...diagForm, codigo: e.target.value })} placeholder="J18.9" />
          </div>
          <div className="field">
            <label>Diagnóstico</label>
            <input type="text" value={diagForm.diagnostico} onChange={(e) => setDiagForm({ ...diagForm, diagnostico: e.target.value })} placeholder="Nombre del diagnóstico" />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea value={diagForm.descripcion} onChange={(e) => setDiagForm({ ...diagForm, descripcion: e.target.value })} placeholder="Descripción adicional"></textarea>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontWeight: 'normal' }}>
              <input type="checkbox" checked={diagForm.presuntivo} onChange={(e) => setDiagForm({ ...diagForm, presuntivo: e.target.checked })} />
              Presuntivo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontWeight: 'normal' }}>
              <input type="checkbox" checked={diagForm.definitivo} onChange={(e) => setDiagForm({ ...diagForm, definitivo: e.target.checked })} />
              Definitivo
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalDiagIngreso(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={() => guardarDiag('ingreso')}>Guardar</button>
          </div>
        </div>
      </div>

      {/* MODAL DIAGNÓSTICO EGRESO */}
      <div className={`modal-overlay ${modalDiagEgreso ? 'open' : ''}`}>
        <div className="modal">
          <h3>Agregar Diagnóstico de Egreso</h3>
          <div className="field">
            <label>Código CIE-10</label>
            <input type="text" value={diagForm.codigo} onChange={(e) => setDiagForm({ ...diagForm, codigo: e.target.value })} placeholder="J18.9" />
          </div>
          <div className="field">
            <label>Diagnóstico</label>
            <input type="text" value={diagForm.diagnostico} onChange={(e) => setDiagForm({ ...diagForm, diagnostico: e.target.value })} placeholder="Nombre del diagnóstico" />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea value={diagForm.descripcion} onChange={(e) => setDiagForm({ ...diagForm, descripcion: e.target.value })} placeholder="Descripción adicional"></textarea>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontWeight: 'normal' }}>
              <input type="checkbox" checked={diagForm.presuntivo} onChange={(e) => setDiagForm({ ...diagForm, presuntivo: e.target.checked })} />
              Presuntivo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontWeight: 'normal' }}>
              <input type="checkbox" checked={diagForm.definitivo} onChange={(e) => setDiagForm({ ...diagForm, definitivo: e.target.checked })} />
              Definitivo
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalDiagEgreso(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={() => guardarDiag('egreso')}>Guardar</button>
          </div>
        </div>
      </div>

      {/* MODAL MÉDICO */}
      <div className={`modal-overlay ${modalMedico ? 'open' : ''}`}>
        <div className="modal">
          <h3>Agregar Médico Tratante</h3>
          <div className="field">
            <label>Nombre</label>
            <input type="text" value={medicoForm.nombre} onChange={(e) => setMedicoForm({ ...medicoForm, nombre: e.target.value })} placeholder="Nombre completo" />
          </div>
          <div className="field">
            <label>Especialidad</label>
            <input type="text" value={medicoForm.especialidad} onChange={(e) => setMedicoForm({ ...medicoForm, especialidad: e.target.value })} placeholder="Cardiología, Neurocirugía, etc" />
          </div>
          <div className="field">
            <label>Cédula Profesional (Opcional)</label>
            <input type="text" value={medicoForm.cedula} onChange={(e) => setMedicoForm({ ...medicoForm, cedula: e.target.value })} placeholder="0123456789" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalMedico(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={guardarMedico}>Guardar</button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast.visible ? 'show' : ''} ${toast.type === 'ok' ? 'toast-ok' : 'toast-err'}`}>
        {toast.message}
      </div>
    </div>
  );
};

export default Epicrisis;