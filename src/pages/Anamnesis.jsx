import React, { useState, useEffect } from 'react';

const Anamnesis = () => {
  const [formData, setFormData] = useState({
    // Paciente
    establecimiento: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    nroHistoria: '',
    // Sección 1: Motivo
    motivoPrincipal: '',
    motivoSecundario: '',
    observaciones: '',
    notas: '',
    // Datos gineco-obstétricos
    menarquia: '',
    menopausia: '',
    ciclos: '',
    vidaSexualActiva: '',
    gestas: '',
    partos: '',
    abortos: '',
    cesareas: '',
    hijosVivos: '',
    fum: '',
    fup: '',
    fuc: '',
    metodoPlanificacion: '',
    terapiaHormonal: '',
    colposcopia: '',
    mamografia: '',
    biopsia: '',
    // Sección 4: Enfermedad actual
    cronologia: '',
    localizacion: '',
    intensidad: '',
    factoresAgravantes: '',
    sintomasAsociados: '',
    medicamentos: '',
    examenesAnteriores: '',
    condicionActual: '',
    // Sección 5: Hallazgos sistemas
    hallazgosSistemas: '',
    // Signos vitales
    presionArterial: '',
    frecCardíaca: '',
    frecRespiratoria: '',
    tempAxilar: '',
    tempBucal: '',
    peso: '',
    talla: '',
    perimetroCefalico: '',
    // Sección 7: Hallazgos físicos
    hallazgosFisicos: '',
    // Sección 9
    planDiagnostico: '',
    planTerapeutico: '',
    planEducacional: '',
    planSeguimiento: '',
    planInterconsultas: '',
    planOtros: '',
    nombreProfesional: '',
    codigoProfesional: '',
    fechaHoraPlan: '',
  });

  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeNav, setActiveNav] = useState('s0');
  const [toast, setToast] = useState({ visible: false });
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [antPersonalesChecked, setAntPersonalesChecked] = useState([]);
  const [antFamiliaresChecked, setAntFamiliaresChecked] = useState([]);
  const [sistemasStates, setSistemasStates] = useState({});
  const [examenFisicoStates, setExamenFisicoStates] = useState({});

  const antPersonalesData = [
    { num: 1, label: 'Vacunas' }, { num: 2, label: 'Enf. Perinatal' }, { num: 3, label: 'Enf. Infancia' },
    { num: 4, label: 'Enf. Adolescente' }, { num: 5, label: 'Enf. Alérgica' }, { num: 6, label: 'Enf. Cardíaca' },
    { num: 7, label: 'Enf. Respiratoria' }, { num: 8, label: 'Enf. Digestiva' }, { num: 9, label: 'Enf. Neurológica' },
    { num: 10, label: 'Enf. Metabólica' }, { num: 11, label: 'Enf. Hemo-Linfática' }, { num: 12, label: 'Enf. Urinaria' },
    { num: 13, label: 'Enf. Traumatológica' }, { num: 14, label: 'Enf. Quirúrgica' }, { num: 15, label: 'Enf. Mental' },
    { num: 16, label: 'Enf. T. Sexual' }, { num: 17, label: 'Tendencia Sexual' }, { num: 18, label: 'Riesgo Social' },
    { num: 19, label: 'Riesgo Laboral' }, { num: 20, label: 'Riesgo Familiar' }, { num: 21, label: 'Actividad Física' },
    { num: 22, label: 'Dieta y Hábitos' }, { num: 23, label: 'Religión y Cultura' }, { num: 24, label: 'Otro' },
  ];

  const antFamiliaresData = [
    { num: 1, label: 'Cardiopatía' }, { num: 2, label: 'Diabetes' }, { num: 3, label: 'Enf. Cerebrovascular' },
    { num: 4, label: 'Hipertensión' }, { num: 5, label: 'Cáncer' }, { num: 6, label: 'Tuberculosis' },
    { num: 7, label: 'Enf. Mental' }, { num: 8, label: 'Enf. Infecciosa' }, { num: 9, label: 'Malformación' },
    { num: 10, label: 'Otro' },
  ];

  const sistemasData = [
    { num: 1, label: 'Órganos de los Sentidos' }, { num: 2, label: 'Respiratorio' },
    { num: 3, label: 'Cardio-Vascular' }, { num: 4, label: 'Digestivo' }, { num: 5, label: 'Genital' },
    { num: 6, label: 'Urinario' }, { num: 7, label: 'Músculo-Esquelético' }, { num: 8, label: 'Endocrino' },
    { num: 9, label: 'Hemo-Linfático' }, { num: 10, label: 'Nervioso' },
  ];

  const examenFisicoData = [
    { id: '1-R', label: 'Piel - Faneras' }, { id: '2-R', label: 'Cabeza' }, { id: '3-R', label: 'Ojos' },
    { id: '4-R', label: 'Oídos' }, { id: '5-R', label: 'Nariz' }, { id: '6-R', label: 'Boca' },
    { id: '7-R', label: 'Orofaringe' }, { id: '8-R', label: 'Cuello' }, { id: '9-R', label: 'Axilas - Mamas' },
    { id: '10-R', label: 'Tórax' }, { id: '11-R', label: 'Abdomen' }, { id: '12-R', label: 'Columna Vertebral' },
    { id: '13-R', label: 'Ingle - Periné' }, { id: '14-R', label: 'Miembros Superiores' },
    { id: '15-R', label: 'Miembros Inferiores' }, { id: '1-S', label: 'Órganos de los Sentidos' },
    { id: '2-S', label: 'Respiratorio' }, { id: '3-S', label: 'Cardio-Vascular' }, { id: '4-S', label: 'Digestivo' },
    { id: '5-S', label: 'Genital' }, { id: '6-S', label: 'Urinario' }, { id: '7-S', label: 'Músculo-Esquelético' },
    { id: '8-S', label: 'Endocrino' }, { id: '9-S', label: 'Hemo-Linfático' }, { id: '10-S', label: 'Neurológico' },
  ];

  // Inyectar estilos CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const styles = `
      :root {
        --bg: #eef2f7;
        --surface: #f4f7fb;
        --surface2: #ffffff;
        --accent: #76c4d5;
        --accent-mid: #76c4d5;
        --accent-light: #76c4d5;
        --accent2: #c8433a;
        --accent3: #e8a020;
        --accent-teal: #00838f;
        --text: #1c2a3a;
        --text-muted: #5a6a7a;
        --border: #c8d8e8;
        --border-strong: #8aaabf;
        --section-bg: #76c4d5;
        --section-text: #f0f6ff;
        --input-bg: #f8fbff;
        --shadow: 0 2px 12px rgba(10,61,98,0.08);
        --shadow-hover: 0 6px 24px rgba(10,61,98,0.16);
        --header-gradient: linear-gradient(135deg, #76c4d546 0%, #76c4d56b 100%);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
         font-family: 'Montserrat';
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
        .app-header {
        background: #ffffff;
        padding: 28px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        top: 0;
        z-index: 100;
        box-shadow: 0 4px 20px rgba(105, 201, 187, 0.6);
      }
      .app-headerList {
        
        padding: 22px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 80;
        box-shadow: 0 4px 20px rgba(105, 201, 187, 0.6);
      }
      .app-header h1 {
        font-family: 'Montserrat';
        font-size: 1.6rem;
        color: #595759;
        letter-spacing: -0.02em;
      }
      .app-header p {
        font-size: 0.69rem;
        color: rgb(33, 63, 92);
        margin-top: 2px;
        font-weight: 300;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .header-badge {
        background: #76c4d5a6;
        border: 1px solid #595759;
        color: #ffffff;
        padding: 8px 18px;
        border-radius: 6px;
        font-size: 0.01rem;
        font-weight: 100;
        letter-spacing: 0.01em;
      }
      .progress-nav {
        background: #76c4d57f;
        border-bottom: 1px solid rgb(27, 4, 4);
        padding: 0 40px;
        display: flex;
        gap: 0;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .progress-nav::-webkit-scrollbar { display: none; }
      .nav-tab {
        padding: 14px 2px;
        font-size: 0.69rem;
        font-weight: 500;
        color: #595759;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .nav-tab:hover { color: #4ea685; }
      .nav-tab.active { color: #4ea685; border-bottom-color: #64b5f6; }
      .nav-tab.completed { color: #80cbc4; }
      .nav-tab.completed .tab-num { background: #00838f; color: white; }
      .tab-num {
        width: 22px; height: 22px;
        border-radius: 50%;
        background: rgb(255, 255, 255);
        color: rgba(25, 79, 146, 0.8);
        font-size: 0.69rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .nav-tab.active .tab-num {
        background: #24517b;
        color: #ffffff;
      }
      .app-body {
        max-width: 960px;
        margin: 0 auto;
        padding: 30px 24px 80px;
      }
      .patient-card {
        background: var(--surface2);
        border-radius: 16px;
        padding: 28px 32px;
        margin-bottom: 32px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        border-top: 4px solid var(--accent-light);
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 120px 120px;
        gap: 20px;
        align-items: end;
      }
      .section-card {
        background: var(--surface2);
        border-radius: 16px;
        margin-bottom: 24px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        overflow: hidden;
        transition: box-shadow 0.2s;
      }
      .section-card:hover { box-shadow: var(--shadow-hover); }
      .section-card.collapsed .section-body { display: none; }
      .section-header {
        background: #595759;
        padding: 18px 28px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        user-select: none;
      }
      .section-num {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: #76c4d5;
        color: #ffffff;
        font-family: 'Montserrat';
        font-size: 0.69rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .section-title {
        font-family: 'Montserrat';
        font-size: 0.99rem;
        color: #ffffff;
        letter-spacing: -0.01em;
      }
      .section-subtitle {
        font-size: 0.69rem;
        color: #ffffff;
        font-weight: 300;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-top: 1px;
      }
      .section-toggle {
        margin-left: auto;
        width: 28px; height: 28px;
        background: #ffffff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #595759;
        font-size: 0.69rem;
        transition: transform 0.25s;
      }
      .section-card.collapsed .section-toggle { transform: rotate(-90deg); }
      .section-body {
      
        padding: 28px 28px;
        transition: all 0.3s ease;
      }
      .field-group {
      
        margin-bottom: 20px;
      }
      .field-label {
        display: block;
        font-size: 0.69rem;
        font-weight: 600;
        color: #595759;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 7px;
      }
      .field-input, .field-textarea, .field-select {
        width: 100%;
        background: var(--input-bg);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        padding: 11px 14px;
        font-family: 'Montserrat';
        font-size: 0.69rem;
        color: var(--text);
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        appearance: none;
      }
      .field-input:focus, .field-textarea:focus, .field-select:focus {
        border-color: var(--accent-light);
        box-shadow: 0 0 0 3px rgba(30,136,229,0.12);
      }
      .field-textarea {
        resize: vertical;
        min-height: 90px;
        line-height: 1.6;
      }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
      .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
      .check-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .check-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--input-bg);
      }
      .check-item:hover { border-color: var(--accent-light); background: rgba(30,136,229,0.05); }
      .check-item.checked { border-color: var(--accent); background: rgba(10,61,98,0.07); }
      .check-item input[type=checkbox] { display: none; }
      .check-box {
        width: 18px; height: 18px;
        border: 2px solid var(--border-strong);
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .check-item.checked .check-box {
        background: var(--accent);
        border-color: var(--accent);
      }
      .check-mark {
        color: white;
        font-size: 0.69rem;
        display: none;
      }
      .check-item.checked .check-mark { display: block; }
      .check-label {
        font-size: 0.69rem;
        font-weight: 500;
        color: var(--text);
        line-height: 1.3;
      }
      .check-num {
        font-size: 0.69rem;
        color: var(--text-muted);
      }
      .sistemas-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        background: #69c9bb2b;
      }
      .sistema-card {
        border: 1.5px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        background: var(--input-bg);
      }
      .sistema-name {
        padding: 10px 12px;
        font-size: 0.69rem;
        font-weight: 600;
        text-align: center;
        background: #76c4d52c;
        color: #595759;
        border-bottom: 1px solid var(--border);
        line-height: 1.3;
        min-height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sistema-toggle {
        display: flex;
        background: #ffffff;
      }
      .sis-btn {
        flex: 1;
        padding: 10px 8px;
        font-size: 0.69rem;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
        border: none;
        background: #76c4d57d;
        color: var(--text-muted);
        letter-spacing: 0.04em;
        transition: all 0.15s;
        font-family: 'Montserrat';
      }
      .sis-btn:first-child { border-right: 1px solid var(--border); }
      .sis-btn:hover { background: var(--border); }
      .sis-btn.cp-active { background: #fde8e7; color: var(--accent2); }
      .sis-btn.sp-active { background: #ffffff; color: var(--accent-light); }
      .vitales-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
      .vital-card {
        background: linear-gradient(135deg, #eef4fb, #f4f8ff);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 18px 16px;
        text-align: center;
        border-top: 3px solid var(--accent-light);
      }
      .vital-icon { font-size: 0.69rem; margin-bottom: 8px; }
      .vital-name { font-size: 0.69rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
      .vital-input {
        width: 100%;
        border: 1.5px solid var(--border);
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 0.69rem;
        font-weight: 600;
        text-align: center;
        background: white;
        font-family: 'Montserrat';
        outline: none;
        color: var(--accent);
        transition: border-color 0.2s;
      }
      .vital-input:focus { border-color: var(--accent-light); }
      .vital-unit { font-size: 0.72rem; color: var(--text-muted); margin-top: 5px; }
      .diag-row {
        display: grid;
        grid-template-columns: 1fr 120px auto auto;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      .diag-badge {
        display: inline-flex;
        gap: 4px;
      }
      .badge-btn {
        padding: 6px 14px;
        border-radius: 100px;
        border: 1.5px solid var(--border);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        background: transparent;
        font-family: 'Montserrat';
        transition: all 0.15s;
        letter-spacing: 0.04em;
      }
      .badge-btn.pre.active { background: var(--accent3); border-color: var(--accent3); color: white; }
      .badge-btn.def.active { background: var(--accent-mid); border-color: var(--accent-mid); color: white; }
      .badge-btn:hover { border-color: var(--border-strong); }
      .add-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: transparent;
        border: 1.5px dashed var(--border-strong);
        border-radius: 10px;
        color: var(--text-muted);
        font-size: 0.85rem;
        cursor: pointer;
        font-family: 'Montserrat';
        transition: all 0.2s;
        font-weight: 500;
        margin-top: 8px;
      }
      .add-btn:hover { border-color: var(--accent-light); color: var(--accent-light); background: rgba(30,136,229,0.05); }
      .remove-btn {
        width: 32px; height: 32px;
        border-radius: 8px;
        border: 1.5px solid #f8d7d6;
        background: #fef5f5;
        color: var(--accent2);
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .remove-btn:hover { background: var(--accent2); color: white; }
      .save-bar {
        position: fixed;
        bottom: 0;
        left: 0; right: 0;
        background: var(--surface2);
        border-top: 1px solid var(--border);
        padding: 16px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 99;
        box-shadow: 0 -4px 20px rgba(10,61,98,0.1);
      }
      .save-info { font-size: 0.82rem; color: var(--text-muted); }
      .save-info strong { color: var(--accent); }
      .btn-save {
        padding: 13px 32px;
        background: #69c9bb98;
        color: #595759;
        border: none;
        border-radius: 100px;
        font-family: 'Montserrat';
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        letter-spacing: 0.02em;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-save:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 16px rgb(10, 61, 98); }
      .btn-print {
        padding: 13px 24px;
        background: transparent;
        color: #595759;
        border: 1.5px solid var(--accent);
        border-radius: 100px;
        font-family: 'Montserrat';
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-right: 12px;
      }
      .btn-print:hover { background: rgba(10,61,98,0.07); }
      .divider {
        height: 1px;
        background: var(--border);
        margin: 24px 0;
      }
      .field-note {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 4px;
        font-style: italic;
      }
      .toast {
        position: fixed;
        top: 24px;
        right: 24px;
        background: var(--accent);
        color: white;
        padding: 14px 22px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(10,61,98,0.3);
        transform: translateY(-80px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 999;
      }
      .toast.show { transform: translateY(0); opacity: 1; }
      @media (max-width: 700px) {
        .app-header { padding: 18px 20px; }
        .app-header h1 { font-size: 1.3rem; }
        .progress-nav { padding: 0 12px; }
        .app-body { padding: 24px 12px 80px; }
        .patient-card { grid-template-columns: 1fr 1fr; }
        .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        .sistemas-grid { grid-template-columns: repeat(2, 1fr); }
        .section-body { padding: 20px 16px; }
        .save-bar { padding: 12px 16px; }
        .diag-row { grid-template-columns: 1fr; }
      }
      @media print {
        .save-bar, .progress-nav, .app-header { display: none; }
        .section-card { box-shadow: none; border: 1px solid #ccc; break-inside: avoid; }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
      document.head.removeChild(link);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckboxChange = (type, num) => {
    if (type === 'personales') {
      setAntPersonalesChecked(prev =>
        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
      );
    } else {
      setAntFamiliaresChecked(prev =>
        prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
      );
    }
  };

  const toggleSisBtn = (id, type) => {
    setSistemasStates(prev => ({ ...prev, [id]: type }));
  };

  const toggleExamenFisicoBtn = (id, type) => {
    setExamenFisicoStates(prev => ({ ...prev, [id]: type }));
  };

  const addDiagnostico = () => {
    setDiagnosticos([...diagnosticos, { id: Date.now(), diagnostico: '', cie: '', pre: false, def: false }]);
  };

  const removeDiagnostico = (id) => {
    setDiagnosticos(diagnosticos.filter(d => d.id !== id));
  };

  const toggleDiagBadge = (id, type) => {
    setDiagnosticos(diagnosticos.map(d =>
      d.id === id ? { ...d, pre: type === 'pre', def: type === 'def' } : d
    ));
  };

  const updateDiagnostico = (id, field, value) => {
    setDiagnosticos(diagnosticos.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const guardarFormulario = () => {
    setToast({ visible: true });
    setTimeout(() => setToast({ visible: false }), 2800);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(id);
    }
  };

  return (
    <>
     
      <nav className="app-headerList bg-gradient-to-br from-[#76c4d5]/20 via-[#EAF4FB] to-[#76c4d5]">
        {[{ id: 's0', num: '★', label: 'Paciente' },
          { id: 's1', num: '1', label: 'Motivo' },
          { id: 's2', num: '2', label: 'Antec. Personales' },
          { id: 's3', num: '3', label: 'Antec. Familiares' },
          { id: 's4', num: '4', label: 'Enfermedad Actual' },
          { id: 's5', num: '5', label: 'Órganos y Sistemas' },
          { id: 's6', num: '6', label: 'Signos Vitales' },
          { id: 's7', num: '7', label: 'Examen Físico' },
          { id: 's8', num: '8', label: 'Diagnóstico' },
          { id: 's9', num: '9', label: 'Planes' }].map(tab => (
          <div key={tab.id} className={`nav-tab ${activeNav === tab.id ? 'active' : ''}`} onClick={() => scrollToSection(tab.id)}>
            <span className="tab-num">{tab.num}</span> {tab.label}
          </div>
        ))}
      </nav>

      <main className="app-body">
        {/* PACIENTE */}
        <div id="s0" className="patient-card">
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label">Establecimiento</label>
            <input className="field-input" type="text" name="establecimiento" value={formData.establecimiento} onChange={handleInputChange} placeholder="Nombre del establecimiento" />
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label">Nombre(s)</label>
            <input className="field-input" type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} placeholder="Nombres del paciente" />
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label">Apellidos</label>
            <input className="field-input" type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Apellidos del paciente" />
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label">Sexo</label>
            <select className="field-select" name="sexo" value={formData.sexo} onChange={handleInputChange}>
              <option value="">—</option>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>
          </div>
          <div className="field-group" style={{ margin: 0 }}>
            <label className="field-label">N° Historia</label>
            <input className="field-input" type="text" name="nroHistoria" value={formData.nroHistoria} onChange={handleInputChange} placeholder="0000" />
          </div>
        </div>

        {/* SECCIÓN 1 */}
        <div id="s1" className={`section-card ${collapsedSections.s1 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s1')}>
            <div className="section-num">1</div>
            <div>
              <div className="section-title">Motivo de Consulta</div>
              <div className="section-subtitle">Versión del informante</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="grid-2">
              <div className="field-group">
                <label className="field-label">A — Motivo Principal</label>
                <textarea className="field-textarea" name="motivoPrincipal" value={formData.motivoPrincipal} onChange={handleInputChange} placeholder="Describa el motivo principal..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">C — Motivo Secundario</label>
                <textarea className="field-textarea" name="motivoSecundario" value={formData.motivoSecundario} onChange={handleInputChange} placeholder="Otros motivos..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">B — Observaciones</label>
                <textarea className="field-textarea" name="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Observaciones adicionales..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">D — Notas</label>
                <textarea className="field-textarea" name="notas" value={formData.notas} onChange={handleInputChange} placeholder="Notas complementarias..."></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2 */}
        <div id="s2" className={`section-card ${collapsedSections.s2 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s2')}>
            <div className="section-num">2</div>
            <div>
              <div className="section-title">Antecedentes Personales</div>
              <div className="section-subtitle">Marque y describa con el número respectivo</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="check-grid">
              {antPersonalesData.map(item => (
                <label key={item.num} className={`check-item ${antPersonalesChecked.includes(item.num) ? 'checked' : ''}`} onClick={() => handleCheckboxChange('personales', item.num)}>
                  <input type="checkbox" checked={antPersonalesChecked.includes(item.num)} readOnly />
                  <div className="check-box"><span className="check-mark">✓</span></div>
                  <div>
                    <div className="check-num">{item.num}</div>
                    <div className="check-label">{item.label}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="divider"></div>
            <p className="field-label" style={{ marginBottom: '14px' }}>Datos gineco-obstétricos (si aplica)</p>
            <div className="grid-4">
              <div className="field-group"><label className="field-label">Menarquía (edad)</label><input className="field-input" type="number" name="menarquia" value={formData.menarquia} onChange={handleInputChange} placeholder="años" /></div>
              <div className="field-group"><label className="field-label">Menopausia (edad)</label><input className="field-input" type="number" name="menopausia" value={formData.menopausia} onChange={handleInputChange} placeholder="años" /></div>
              <div className="field-group"><label className="field-label">Ciclos</label><input className="field-input" type="text" name="ciclos" value={formData.ciclos} onChange={handleInputChange} placeholder="ej. 28/4" /></div>
              <div className="field-group"><label className="field-label">Vida sexual activa</label><select className="field-select" name="vidaSexualActiva" value={formData.vidaSexualActiva} onChange={handleInputChange}><option>—</option><option>Sí</option><option>No</option></select></div>
              <div className="field-group"><label className="field-label">Gestas</label><input className="field-input" type="number" name="gestas" value={formData.gestas} onChange={handleInputChange} placeholder="0" /></div>
              <div className="field-group"><label className="field-label">Partos</label><input className="field-input" type="number" name="partos" value={formData.partos} onChange={handleInputChange} placeholder="0" /></div>
              <div className="field-group"><label className="field-label">Abortos</label><input className="field-input" type="number" name="abortos" value={formData.abortos} onChange={handleInputChange} placeholder="0" /></div>
              <div className="field-group"><label className="field-label">Cesáreas</label><input className="field-input" type="number" name="cesareas" value={formData.cesareas} onChange={handleInputChange} placeholder="0" /></div>
              <div className="field-group"><label className="field-label">Hijos vivos</label><input className="field-input" type="number" name="hijosVivos" value={formData.hijosVivos} onChange={handleInputChange} placeholder="0" /></div>
              <div className="field-group"><label className="field-label">FUM</label><input className="field-input" type="date" name="fum" value={formData.fum} onChange={handleInputChange} /></div>
              <div className="field-group"><label className="field-label">FUP</label><input className="field-input" type="date" name="fup" value={formData.fup} onChange={handleInputChange} /></div>
              <div className="field-group"><label className="field-label">FUC</label><input className="field-input" type="date" name="fuc" value={formData.fuc} onChange={handleInputChange} /></div>
            </div>
            <div className="grid-4" style={{ marginTop: '8px' }}>
              <div className="field-group"><label className="field-label">Método P. Familiar</label><input className="field-input" type="text" name="metodoPlanificacion" value={formData.metodoPlanificacion} onChange={handleInputChange} placeholder="Método usado" /></div>
              <div className="field-group"><label className="field-label">Terapia hormonal</label><select className="field-select" name="terapiaHormonal" value={formData.terapiaHormonal} onChange={handleInputChange}><option>—</option><option>Sí</option><option>No</option></select></div>
              <div className="field-group"><label className="field-label">Colposcopía</label><input className="field-input" type="date" name="colposcopia" value={formData.colposcopia} onChange={handleInputChange} /></div>
              <div className="field-group"><label className="field-label">Mamografía</label><input className="field-input" type="date" name="mamografia" value={formData.mamografia} onChange={handleInputChange} /></div>
              <div className="field-group"><label className="field-label">Biopsia</label><select className="field-select" name="biopsia" value={formData.biopsia} onChange={handleInputChange}><option>—</option><option>Sí</option><option>No</option></select></div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3 */}
        <div id="s3" className={`section-card ${collapsedSections.s3 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s3')}>
            <div className="section-num">3</div>
            <div>
              <div className="section-title">Antecedentes Familiares</div>
              <div className="section-subtitle">Seleccione y describa anotando el número</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="check-grid">
              {antFamiliaresData.map(item => (
                <label key={item.num} className={`check-item ${antFamiliaresChecked.includes(item.num) ? 'checked' : ''}`} onClick={() => handleCheckboxChange('familiares', item.num)}>
                  <input type="checkbox" checked={antFamiliaresChecked.includes(item.num)} readOnly />
                  <div className="check-box"><span className="check-mark">✓</span></div>
                  <div>
                    <div className="check-num">{item.num}</div>
                    <div className="check-label">{item.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN 4 */}
        <div id="s4" className={`section-card ${collapsedSections.s4 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s4')}>
            <div className="section-num">4</div>
            <div>
              <div className="section-title">Enfermedad o Problema Actual</div>
              <div className="section-subtitle">Cronología, localización, características, intensidad, causa aparente…</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="grid-2">
              <div className="field-group"><label className="field-label">Cronología e Inicio</label><textarea className="field-textarea" name="cronologia" value={formData.cronologia} onChange={handleInputChange} placeholder="¿Cuándo inició?..."></textarea></div>
              <div className="field-group"><label className="field-label">Localización y Características</label><textarea className="field-textarea" name="localizacion" value={formData.localizacion} onChange={handleInputChange} placeholder="¿Dónde?..."></textarea></div>
              <div className="field-group"><label className="field-label">Intensidad y Causa Aparente</label><textarea className="field-textarea" name="intensidad" value={formData.intensidad} onChange={handleInputChange} placeholder="Escala de dolor (1-10)..."></textarea></div>
              <div className="field-group"><label className="field-label">Factores que Agravan / Mejoran</label><textarea className="field-textarea" name="factoresAgravantes" value={formData.factoresAgravantes} onChange={handleInputChange} placeholder="¿Qué lo empeora?..."></textarea></div>
              <div className="field-group"><label className="field-label">Síntomas Asociados y Evolución</label><textarea className="field-textarea" name="sintomasAsociados" value={formData.sintomasAsociados} onChange={handleInputChange} placeholder="Síntomas concomitantes..."></textarea></div>
              <div className="field-group"><label className="field-label">Medicamentos que Recibe</label><textarea className="field-textarea" name="medicamentos" value={formData.medicamentos} onChange={handleInputChange} placeholder="Nombre, dosis..."></textarea></div>
              <div className="field-group"><label className="field-label">Resultados de Exámenes Anteriores</label><textarea className="field-textarea" name="examenesAnteriores" value={formData.examenesAnteriores} onChange={handleInputChange} placeholder="Exámenes previos..."></textarea></div>
              <div className="field-group"><label className="field-label">Condición Actual</label><textarea className="field-textarea" name="condicionActual" value={formData.condicionActual} onChange={handleInputChange} placeholder="Estado general..."></textarea></div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5 */}
        <div id="s5" className={`section-card ${collapsedSections.s5 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s5')}>
            <div className="section-num">5</div>
            <div>
              <div className="section-title">Revisión Actual de Órganos y Sistemas</div>
              <div className="section-subtitle">CP = Con Patología · SP = Sin Patología</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="sistemas-grid">
              {sistemasData.map(s => (
                <div key={s.num} className="sistema-card">
                  <div className="sistema-name">{s.num}. {s.label}</div>
                  <div className="sistema-toggle">
                    <button className={`sis-btn ${sistemasStates[`s${s.num}`] === 'cp' ? 'cp-active' : ''}`} onClick={() => toggleSisBtn(`s${s.num}`, 'cp')}>CP</button>
                    <button className={`sis-btn ${sistemasStates[`s${s.num}`] === 'sp' ? 'sp-active' : ''}`} onClick={() => toggleSisBtn(`s${s.num}`, 'sp')}>SP</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="field-group">
              <label className="field-label">Descripción de hallazgos (CP)</label>
              <textarea className="field-textarea" name="hallazgosSistemas" value={formData.hallazgosSistemas} onChange={handleInputChange} placeholder="Describa aquí los sistemas con patología..."></textarea>
            </div>
          </div>
        </div>

        {/* SECCIÓN 6 */}
        <div id="s6" className={`section-card ${collapsedSections.s6 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s6')}>
            <div className="section-num">6</div>
            <div>
              <div className="section-title">Signos Vitales y Mediciones</div>
              <div className="section-subtitle">Valores al momento del examen</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="vitales-grid">
              <div className="vital-card">
                <div className="vital-icon">🩸</div>
                <div className="vital-name">Presión Arterial</div>
                <input className="vital-input" type="text" name="presionArterial" value={formData.presionArterial} onChange={handleInputChange} placeholder="120/80" />
                <div className="vital-unit">mmHg</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">❤️</div>
                <div className="vital-name">Frec. Cardíaca</div>
                <input className="vital-input" type="number" name="frecCardíaca" value={formData.frecCardíaca} onChange={handleInputChange} placeholder="72" />
                <div className="vital-unit">lpm</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">💨</div>
                <div className="vital-name">Frec. Respiratoria</div>
                <input className="vital-input" type="number" name="frecRespiratoria" value={formData.frecRespiratoria} onChange={handleInputChange} placeholder="16" />
                <div className="vital-unit">rpm</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">🌡️</div>
                <div className="vital-name">Temp. Axilar</div>
                <input className="vital-input" type="number" step="0.1" name="tempAxilar" value={formData.tempAxilar} onChange={handleInputChange} placeholder="36.5" />
                <div className="vital-unit">°C</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">🌡️</div>
                <div className="vital-name">Temp. Bucal</div>
                <input className="vital-input" type="number" step="0.1" name="tempBucal" value={formData.tempBucal} onChange={handleInputChange} placeholder="37.0" />
                <div className="vital-unit">°C</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">⚖️</div>
                <div className="vital-name">Peso</div>
                <input className="vital-input" type="number" step="0.1" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="70.0" />
                <div className="vital-unit">kg</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">📏</div>
                <div className="vital-name">Talla</div>
                <input className="vital-input" type="number" step="0.01" name="talla" value={formData.talla} onChange={handleInputChange} placeholder="1.70" />
                <div className="vital-unit">m</div>
              </div>
              <div className="vital-card">
                <div className="vital-icon">🔵</div>
                <div className="vital-name">Perímetro Cefálico</div>
                <input className="vital-input" type="number" step="0.1" name="perimetroCefalico" value={formData.perimetroCefalico} onChange={handleInputChange} placeholder="54.0" />
                <div className="vital-unit">cm</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 7 */}
        <div id="s7" className={`section-card ${collapsedSections.s7 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s7')}>
            <div className="section-num">7</div>
            <div>
              <div className="section-title">Examen Físico</div>
              <div className="section-subtitle">Regional (R) y Sistémico (S) · CP/SP</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="sistemas-grid">
              {examenFisicoData.map(item => (
                <div key={item.id} className="sistema-card">
                  <div className="sistema-name">{item.id} — {item.label}</div>
                  <div className="sistema-toggle">
                    <button className={`sis-btn ${examenFisicoStates[item.id] === 'cp' ? 'cp-active' : ''}`} onClick={() => toggleExamenFisicoBtn(item.id, 'cp')}>CP</button>
                    <button className={`sis-btn ${examenFisicoStates[item.id] === 'sp' ? 'sp-active' : ''}`} onClick={() => toggleExamenFisicoBtn(item.id, 'sp')}>SP</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="field-group">
              <label className="field-label">Descripción de hallazgos del examen físico</label>
              <textarea className="field-textarea" style={{ minHeight: '120px' }} name="hallazgosFisicos" value={formData.hallazgosFisicos} onChange={handleInputChange} placeholder="Describa los hallazgos..."></textarea>
            </div>
          </div>
        </div>

        {/* SECCIÓN 8 */}
        <div id="s8" className={`section-card ${collapsedSections.s8 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s8')}>
            <div className="section-num">8</div>
            <div>
              <div className="section-title">Diagnóstico</div>
              <div className="section-subtitle">PRE = Presuntivo · DEF = Definitivo · CIE</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div id="diagnosticosList">
              {diagnosticos.map(diag => (
                <div key={diag.id} className="diag-row">
                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label">Diagnóstico {diagnosticos.indexOf(diag) + 1}</label>
                    <input className="field-input" type="text" value={diag.diagnostico} onChange={(e) => updateDiagnostico(diag.id, 'diagnostico', e.target.value)} placeholder="Nombre del diagnóstico..." />
                  </div>
                  <div className="field-group" style={{ margin: 0 }}>
                    <label className="field-label">CIE</label>
                    <input className="field-input" type="text" value={diag.cie} onChange={(e) => updateDiagnostico(diag.id, 'cie', e.target.value)} placeholder="Código CIE" />
                  </div>
                  <div className="diag-badge">
                    <button className={`badge-btn pre ${diag.pre ? 'active' : ''}`} onClick={() => toggleDiagBadge(diag.id, 'pre')}>PRE</button>
                    <button className={`badge-btn def ${diag.def ? 'active' : ''}`} onClick={() => toggleDiagBadge(diag.id, 'def')}>DEF</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeDiagnostico(diag.id)}>✕</button>
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={addDiagnostico}>+ Agregar diagnóstico</button>
          </div>
        </div>

        {/* SECCIÓN 9 */}
        <div id="s9" className={`section-card ${collapsedSections.s9 ? 'collapsed' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('s9')}>
            <div className="section-num">9</div>
            <div>
              <div className="section-title">Planes de Tratamiento</div>
              <div className="section-subtitle">Diagnósticos, terapéuticos y educacionales</div>
            </div>
            <div className="section-toggle">▾</div>
          </div>
          <div className="section-body">
            <div className="grid-2">
              <div className="field-group">
                <label className="field-label">Plan 1 — Diagnóstico</label>
                <textarea className="field-textarea" name="planDiagnostico" value={formData.planDiagnostico} onChange={handleInputChange} placeholder="Plan diagnóstico..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Plan 4 — Seguimiento</label>
                <textarea className="field-textarea" name="planSeguimiento" value={formData.planSeguimiento} onChange={handleInputChange} placeholder="Seguimiento y control..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Plan 2 — Terapéutico</label>
                <textarea className="field-textarea" name="planTerapeutico" value={formData.planTerapeutico} onChange={handleInputChange} placeholder="Tratamiento..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Plan 5 — Interconsultas</label>
                <textarea className="field-textarea" name="planInterconsultas" value={formData.planInterconsultas} onChange={handleInputChange} placeholder="Referencias y consultas..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Plan 3 — Educacional</label>
                <textarea className="field-textarea" name="planEducacional" value={formData.planEducacional} onChange={handleInputChange} placeholder="Educación al paciente..."></textarea>
              </div>
              <div className="field-group">
                <label className="field-label">Plan 6 — Otros</label>
                <textarea className="field-textarea" name="planOtros" value={formData.planOtros} onChange={handleInputChange} placeholder="Otros planes..."></textarea>
              </div>
            </div>
            <div className="divider"></div>
            <div className="grid-3">
              <div className="field-group">
                <label className="field-label">Nombre del Profesional</label>
                <input className="field-input" type="text" name="nombreProfesional" value={formData.nombreProfesional} onChange={handleInputChange} placeholder="Dr./Dra. Apellido Nombre" />
              </div>
              <div className="field-group">
                <label className="field-label">Código</label>
                <input className="field-input" type="text" name="codigoProfesional" value={formData.codigoProfesional} onChange={handleInputChange} placeholder="Código profesional" />
              </div>
              <div className="field-group">
                <label className="field-label">Fecha y Hora</label>
                <input className="field-input" type="datetime-local" name="fechaHoraPlan" value={formData.fechaHoraPlan} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="save-bar">
        <div className="save-info">
          <strong>SNS-MSP · HCU-form.003 / 2008</strong><br />
          Formulario de Historia Clínica Única — Anamnesis
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir</button>
          <button className="btn-save" onClick={guardarFormulario}>💾 Guardar Formulario</button>
        </div>
      </div>

      <div className={`toast ${toast.visible ? 'show' : ''}`}>✓ Formulario guardado correctamente</div>
    </>
  );
};

export default Anamnesis;