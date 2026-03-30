import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/ParteOperatorio.css';

// ══════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════
const ADMIN_PIN = '2024'; // ← cambiar en producción
const SALA_SUCIA_MIN = 30; // minutos de bioseguridad entre cirugías

const SN = {
  0: 'Todas las Salas',
  1: 'Sala Operación 1',
  2: 'Sala Operación 2',
  3: 'Sala Operación 3',
  4: 'Sala Operación 4',
  5: 'Hospitalización Día',
  6: 'Endoscopía',
};
const SS = { 0: 'Todas', 1: 'S.1', 2: 'S.2', 3: 'S.3', 4: 'S.4', 5: 'H.Día', 6: 'Endosc.' };

const ESTADOS = {
  programado: { lbl: 'Programado',  icon: '🗓', cls: 'est-programado' },
  en_curso:   { lbl: 'En Curso',    icon: '🔄', cls: 'est-en_curso'   },
  completado: { lbl: 'Completado',  icon: '✅', cls: 'est-completado' },
  cancelado:  { lbl: 'Cancelado',   icon: '❌', cls: 'est-cancelado'  },
  pendiente:  { lbl: 'Pendiente',   icon: '⏸', cls: 'est-pendiente'  },
};

const TIPOS_CX = ['Laparoscópica', 'Abierta', 'Endoscopía', 'Robótica', 'Ambulatoria'];

// ══════════════════════════════════════════════════════════════
// BASE DE DATOS DEMO — reemplazar con fetch() a la API real
// ══════════════════════════════════════════════════════════════
const PACIENTES_DB = [
  { id: 'P001', nom: 'TORRES FERNÁNDEZ, FERNANDA PATRICIA', edad: 40, cedula: '1712345678', tel: '0999000001', email: 'fernanda@example.com', alergias: 'Penicilina' },
  { id: 'P002', nom: 'ANDRADE MORA, PABLO SEBASTIÁN',       edad: 21, cedula: '1756781234', tel: '0999000002', email: 'pablo@example.com',    alergias: ''           },
  { id: 'P003', nom: 'SUÁREZ CABRERA, MARÍA ELENA',         edad: 63, cedula: '1798765432', tel: '0999000003', email: 'maria@example.com',    alergias: 'AINEs'      },
];

const MEDICOS_DB = [
  { id: 'M001', nom: 'DR. VALDEZ',  esp: 'Ginecología y Obstetricia',  tel: '0999000011', email: 'valdez@atlas.com'  },
  { id: 'M002', nom: 'DR. PICOITA', esp: 'Anestesiología',             tel: '0999000012', email: 'picoita@atlas.com' },
  { id: 'M003', nom: 'DR. ANDRADE', esp: 'Cirugía General',            tel: '0999000013', email: 'andrade@atlas.com' },
  { id: 'M004', nom: 'DR. MORA',    esp: 'Anestesiología',             tel: '0999000014', email: 'mora@atlas.com'    },
  { id: 'M005', nom: 'DR. CABRERA', esp: 'Cirugía General — Ayudante', tel: '0999000015', email: 'cabrera@atlas.com' },
  { id: 'M006', nom: 'DR. ALBUJA',  esp: 'Traumatología',              tel: '0999000016', email: 'albuja@atlas.com'  },
  { id: 'M007', nom: 'DR. MÉNDEZ',  esp: 'Gastroenterología',          tel: '0999000017', email: 'mendez@atlas.com'  },
];

// ══════════════════════════════════════════════════════════════
// UTILS PUROS (sin estado de React)
// ══════════════════════════════════════════════════════════════
const fechaKey  = (d) => d.toISOString().slice(0, 10);
const fechaHoy  = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const horaToMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
const minToHora = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const h12 = (h) => {
  const [hh, mm] = h.split(':').map(Number);
  const ap = hh < 12 ? 'AM' : 'PM';
  const h2 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h2}:${String(mm).padStart(2, '0')} ${ap}`;
};

const tcls = (t) =>
  t === 'Laparoscópica' ? 'tlap' : t === 'Abierta' ? 'tab' : t === 'Endoscopía' ? 'ten' : 'trob';

// ── Validación cédula ecuatoriana Módulo 10 ──────────────────
const validarCedula = (ced) => {
  if (!ced) return { ok: false, msg: '' };
  const c = ced.replace(/\D/g, '');
  if (c.length !== 10) return { ok: false, msg: 'Debe tener 10 dígitos' };
  const prov = parseInt(c.substring(0, 2));
  if (prov < 1 || prov > 24) return { ok: false, msg: 'Provincia inválida (01–24)' };
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(c[i]) * coef[i];
    if (val >= 10) val -= 9;
    suma += val;
  }
  const dv = (10 - (suma % 10)) % 10;
  if (dv !== parseInt(c[9])) return { ok: false, msg: 'Cédula inválida — dígito verificador incorrecto' };
  return { ok: true, msg: 'Cédula válida ✓' };
};

// ── Sala sucia: detecta conflicto con 30 min bioseguridad ────
const getConflicto = (registros, sala, horaStr, tpo, excluirId, fecha) => {
  const ini = horaToMin(horaStr);
  const fin = ini + Math.round(tpo * 60);
  for (const r of registros.filter((r) => r.fecha === fecha && r.sala === sala && r.id !== excluirId)) {
    const ri = horaToMin(r.hora);
    const rf = ri + Math.round(r.tpo * 60);
    const rfl = rf + SALA_SUCIA_MIN;
    if (ini < rfl && fin > ri) return { r, esSalaSucia: ini >= rf && ini < rfl, rf, rf_limpieza: rfl };
  }
  return null;
};

// ── Payload SQL-ready para el backend (Juan Diego) ──────────
const buildPayload = (reg) => ({
  schedule_id:        reg.id,
  external_ref:       `ATL-${reg.fecha?.replace(/-/g, '')}-${String(reg.id).padStart(4, '0')}`,
  procedure_date:     reg.fecha,
  start_time:         reg.hora,
  end_time:           minToHora(horaToMin(reg.hora) + Math.round(reg.tpo * 60)),
  duration_hours:     reg.tpo,
  cleanup_buffer_min: SALA_SUCIA_MIN,
  room_id:            reg.sala,
  room_name:          SN[reg.sala] || '',
  patient_name:       reg.nom?.toUpperCase(),
  patient_age:        reg.edad || null,
  patient_cedula:     reg.cedula || null,
  patient_db_id:      reg.pac_id || null,
  surgeon_name:       reg.dr?.toUpperCase(),
  assistant_name:     reg.ayu?.toUpperCase() || null,
  anesthesiologist:   reg.ane?.toUpperCase() || null,
  pediatrician:       reg.ped || null,
  procedure_name:     reg.cir?.toUpperCase(),
  procedure_type:     reg.tipo,
  observations:       reg.obs || null,
  patient_phone:      reg.tel_pac || null,
  surgeon_phone:      reg.tel_dr || null,
  patient_email:      reg.email_pac || null,
  surgeon_email:      reg.email_dr || null,
  status:             (reg.estado || 'programado').toUpperCase(),
  created_at:         new Date().toISOString(),
  updated_at:         new Date().toISOString(),
  created_by:         'PARTE_OPERATORIO_UI',
});

// ── Datos demo ───────────────────────────────────────────────
const HOY = fechaKey(new Date());
let _idC = 0;
const DEMO_REGISTROS = [
  { hora: '07:00', sala: 1, nom: 'FERNANDA TORRES', edad: 40, cir: 'CESÁREA',        dr: 'DR. VALDEZ',  ayu: 'DR. CABRERA', ane: 'DR. PICOITA', tipo: 'Abierta',        tpo: 1,   obs: 'ORH+',    estado: 'completado', tel_pac: '0999000001', tel_dr: '0999000011', email_pac: 'fernanda@example.com', email_dr: 'valdez@atlas.com'  },
  { hora: '11:30', sala: 2, nom: 'PABLO ANDRADE',   edad: 21, cir: 'TOBILLOPLASTIA', dr: 'DR. PICOITA', ayu: 'DR. ALBUJA',  ane: 'DR. MORA',    tipo: 'Laparoscópica', tpo: 1,   obs: 'ORH+',    estado: 'en_curso',   tel_pac: '0999000002', tel_dr: '0999000012', email_pac: 'pablo@example.com',    email_dr: 'picoita@atlas.com' },
  { hora: '11:30', sala: 4, nom: 'PABLO ANDRADE',   edad: 21, cir: 'TOBILLOPLASTIA', dr: 'DR. PICOITA', ayu: 'DR. ALBUJA',  ane: 'DR. MORA',    tipo: 'Laparoscópica', tpo: 1,   obs: 'ORH+',    estado: 'programado', tel_pac: '0999000002', tel_dr: '0999000012', email_pac: 'pablo@example.com',    email_dr: 'picoita@atlas.com' },
  { hora: '14:30', sala: 3, nom: 'MARÍA SUÁREZ',    edad: 63, cir: 'TOBILLOPLASTIA', dr: 'DR. ANDRADE', ayu: 'DR. CABRERA', ane: 'DR. MORA',    tipo: 'Abierta',        tpo: 2,   obs: '',        estado: 'pendiente',  tel_pac: '0999000003', tel_dr: '0999000013', email_pac: 'maria@example.com',    email_dr: 'andrade@atlas.com' },
  { hora: '07:00', sala: 3, nom: 'MARÍA SUÁREZ',    edad: 63, cir: 'TOBILLOPLASTIA', dr: 'DR. ANDRADE', ayu: 'DR. CABRERA', ane: 'DR. MORA',    tipo: 'Abierta',        tpo: 2,   obs: '',        estado: 'programado', tel_pac: '0999000003', tel_dr: '0999000013', email_pac: 'maria@example.com',    email_dr: 'andrade@atlas.com' },
  { hora: '09:00', sala: 6, nom: 'JORGE RIVERA',    edad: 55, cir: 'COLONOSCOPÍA',   dr: 'DR. MÉNDEZ',  ayu: '',            ane: 'DR. PICOITA', tipo: 'Endoscopía',     tpo: 0.5, obs: 'Sedación', estado: 'cancelado',  tel_pac: '0999000004', tel_dr: '0999000014', email_pac: 'jorge@example.com',    email_dr: 'mendez@atlas.com'  },
].map((d) => ({ ...d, id: ++_idC, fecha: HOY, ped: '', cedula: '', pac_id: null }));

// ── Formulario vacío ─────────────────────────────────────────
const FORM_VACIO = {
  fecha: HOY, hora: '07:00', sala: 1,
  nom: '', edad: '', cedula: '', pac_id: null,
  cir: '', dr: '', ayu: '', ane: '', ped: '',
  tipo: 'Laparoscópica', tpo: 1, obs: '',
  tel_pac: '', tel_dr: '', email_pac: '', email_dr: '',
};

// Slots horarios 7:00–19:30 cada 30 min
const HORAS_GRID = [];
for (let h = 7; h <= 19; h++) { HORAS_GRID.push(`${h}:00`); HORAS_GRID.push(`${h}:30`); }

// ══════════════════════════════════════════════════════════════
// COMPONENTE
// ══════════════════════════════════════════════════════════════
const ParteOperatorio = () => {

  // ── Acceso ──────────────────────────────────────────────────
  const [modoAdmin,  setModoAdmin]  = useState(false);
  const [bloqueado,  setBloqueado]  = useState(true);
  const [pin,        setPin]        = useState(['', '', '', '']);
  const [errorPin,   setErrorPin]   = useState('');

  // ── Datos core ──────────────────────────────────────────────
  const [registros,   setRegistros]   = useState(DEMO_REGISTROS);
  const [farmPedidos, setFarmPedidos] = useState([]);
  const farmIdC = useRef(0);

  // ── Navegación ──────────────────────────────────────────────
  const [fechaActiva,   setFechaActiva]   = useState(HOY);
  const [salaFiltro,    setSalaFiltro]    = useState(0);
  const [horariosFecha, setHorariosFecha] = useState(HOY);

  // ── Reloj ───────────────────────────────────────────────────
  const [reloj, setReloj] = useState('');

  // ── Formulario nueva cirugía ─────────────────────────────────
  const [form,           setForm]           = useState({ ...FORM_VACIO });
  const [pacSel,         setPacSel]         = useState(null);   // paciente seleccionado de DB
  const [busqPac,        setBusqPac]        = useState('');
  const [sugerPac,       setSugerPac]       = useState([]);
  const [busqDr,         setBusqDr]         = useState({ fd: '', fay: '', fan: '', fped: '' });
  const [sugerDr,        setSugerDr]        = useState({ fd: [], fay: [], fan: [], fped: [] });
  const [cedulaFb,       setCedulaFb]       = useState('');     // feedback validación cédula
  const [bloqueoWarn,    setBloqueoWarn]    = useState('');     // advertencia sala sucia

  // ── Farmacia form ────────────────────────────────────────────
  const [farmForm, setFarmForm] = useState({ item: '', cant: '', pac: '', prio: 'norm' });

  // ── Modal editar ─────────────────────────────────────────────
  const [editRec, setEditRec] = useState(null);

  // ── Toast ────────────────────────────────────────────────────
  const [toast,     setToast]     = useState({ msg: '', tipo: '', visible: false });
  const toastTimer  = useRef(null);

  // ── ID counter ───────────────────────────────────────────────
  const idC = useRef(_idC);

  // ════════════════════════════════════════════════════════════
  // useEffect — RELOJ EN TIEMPO REAL
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setReloj(
        n.toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
        + '\n' + n.toTimeString().slice(0, 8)
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // useEffect — sincronizar fecha del form
  useEffect(() => { setForm((f) => ({ ...f, fecha: fechaActiva })); }, [fechaActiva]);

  // useEffect — advertencia sala sucia al cambiar hora/sala/tiempo/fecha
  useEffect(() => {
    const conf = getConflicto(registros, Number(form.sala), form.hora, parseFloat(form.tpo) || 1, null, form.fecha);
    if (!conf) { setBloqueoWarn(''); return; }
    setBloqueoWarn(
      conf.esSalaSucia
        ? `🧹 ${SN[form.sala]} en LIMPIEZA hasta las ${h12(minToHora(conf.rf_limpieza))} — próximo slot: ${h12(minToHora(conf.rf_limpieza))}`
        : `⛔ ${SN[form.sala]} ocupada: ${conf.r.nom} — ${conf.r.cir} hasta las ${h12(minToHora(conf.rf))} + 30 min limpieza`
    );
  }, [form.hora, form.sala, form.tpo, form.fecha, registros]);

  // ════════════════════════════════════════════════════════════
  // TOAST
  // ════════════════════════════════════════════════════════════
  const showToast = useCallback((msg, tipo = 'ok') => {
    setToast({ msg, tipo, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  }, []);

  // ════════════════════════════════════════════════════════════
  // ACCESO / PIN
  // ════════════════════════════════════════════════════════════
  const manejarPin = (valor, idx) => {
    if (isNaN(valor)) return;
    const nuevo = [...pin];
    nuevo[idx] = valor.slice(-1);
    setPin(nuevo);
    if (valor && idx < 3) document.getElementById(`pin-${idx + 1}`)?.focus();
    // Verificar automáticamente al llenar el cuarto dígito
    if (idx === 3 && valor) {
      const ingresado = [...nuevo].join('');
      if (ingresado.length === 4) setTimeout(() => verificarConPin(ingresado), 50);
    }
  };

  const verificarConPin = (ingresado) => {
    if (ingresado === ADMIN_PIN) {
      setModoAdmin(true);
      setBloqueado(false);
      setErrorPin('');
      showToast('🔓 Modo ADMINISTRADOR activado');
    } else {
      setErrorPin('Código incorrecto — intente de nuevo');
      setPin(['', '', '', '']);
      setTimeout(() => document.getElementById('pin-0')?.focus(), 50);
    }
  };

  const verificarAcceso = () => verificarConPin(pin.join(''));

  const entrarSoloLectura = () => {
    setModoAdmin(false);
    setBloqueado(false);
    showToast('👁 Modo solo lectura — Vista del parte');
  };

  // ════════════════════════════════════════════════════════════
  // NAVEGACIÓN DE FECHA
  // ════════════════════════════════════════════════════════════
  const cambiarFecha = (delta) => {
    const d = new Date(fechaActiva + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setFechaActiva(fechaKey(d));
  };

  const labelFecha = (fk) =>
    new Date(fk + 'T12:00').toLocaleDateString('es-EC', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    }).toUpperCase();

  // ════════════════════════════════════════════════════════════
  // DATOS COMPUTADOS
  // ════════════════════════════════════════════════════════════
  const cxDelDia = registros.filter((r) => r.fecha === fechaActiva);

  const cxFiltrados = (salaFiltro === 0
    ? cxDelDia
    : cxDelDia.filter((r) => r.sala === salaFiltro)
  ).slice().sort((a, b) => a.hora.localeCompare(b.hora));

  const contPorSala = (s) =>
    s === 0 ? cxDelDia.length : cxDelDia.filter((r) => r.sala === s).length;

  const stats = {
    total: cxFiltrados.length,
    lap:   cxFiltrados.filter((r) => r.tipo === 'Laparoscópica').length,
    ab:    cxFiltrados.filter((r) => r.tipo === 'Abierta').length,
    en:    cxFiltrados.filter((r) => r.tipo === 'Endoscopía').length,
  };
  stats.otros = stats.total - stats.lap - stats.ab - stats.en;

  // ════════════════════════════════════════════════════════════
  // BUSCADOR PACIENTES
  // ════════════════════════════════════════════════════════════
  const buscarPaciente = (q) => {
    setBusqPac(q);
    if (q.length < 2) { setSugerPac([]); return; }
    setSugerPac(
      PACIENTES_DB.filter(
        (p) => p.nom.toLowerCase().includes(q.toLowerCase()) || p.cedula.includes(q)
      ).slice(0, 6)
    );
  };

  const seleccionarPaciente = (p) => {
    setPacSel(p);
    setBusqPac(p.nom);
    setSugerPac([]);
    setForm((f) => ({
      ...f, nom: p.nom, edad: p.edad, cedula: p.cedula,
      pac_id: p.id, tel_pac: p.tel, email_pac: p.email,
      obs: p.alergias ? `Alergia: ${p.alergias}` : f.obs,
    }));
  };

  const limpiarPaciente = () => {
    setPacSel(null);
    setBusqPac('');
    setSugerPac([]);
    setForm((f) => ({ ...f, nom: '', edad: '', cedula: '', pac_id: null, tel_pac: '', email_pac: '' }));
    setCedulaFb('');
  };

  // ════════════════════════════════════════════════════════════
  // BUSCADOR MÉDICOS
  // ════════════════════════════════════════════════════════════
  const buscarMedico = (campo, q) => {
    setBusqDr((b) => ({ ...b, [campo]: q }));
    if (q.length < 2) { setSugerDr((s) => ({ ...s, [campo]: [] })); return; }
    setSugerDr((s) => ({
      ...s,
      [campo]: MEDICOS_DB.filter(
        (m) => m.nom.toLowerCase().includes(q.toLowerCase()) || m.esp.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6),
    }));
  };

  const seleccionarMedico = (campo, m) => {
    setBusqDr((b) => ({ ...b, [campo]: m.nom }));
    setSugerDr((s) => ({ ...s, [campo]: [] }));
    setForm((f) => {
      const upd = { ...f, [campo]: m.nom };
      if (campo === 'fd') { upd.tel_dr = m.tel; upd.email_dr = m.email; }
      return upd;
    });
  };

  // ════════════════════════════════════════════════════════════
  // CRUD — AGREGAR CIRUGÍA
  // ════════════════════════════════════════════════════════════
  const agregarCirugia = () => {
    const nom = form.nom.trim();
    const cir = form.cir.trim();
    const dr  = (busqDr.fd || form.dr).trim();
    if (!nom || !cir || !dr) { showToast('Complete los campos obligatorios (*)', 'err'); return; }

    // Validar cédula manual (si no viene de la DB)
    if (form.cedula && !pacSel) {
      const vCed = validarCedula(form.cedula);
      if (!vCed.ok) { showToast('⚠ Cédula inválida: ' + vCed.msg, 'err'); return; }
    }

    // Verificar conflicto de horario y pedir confirmación
    const tpo  = parseFloat(form.tpo) || 1;
    const sala = Number(form.sala);
    const conf = getConflicto(registros, sala, form.hora, tpo, null, form.fecha);
    if (conf) {
      const finConf = h12(minToHora(conf.rf));
      const finLimp = h12(minToHora(conf.rf_limpieza));
      const detalle = conf.esSalaSucia
        ? `🧹 SALA EN LIMPIEZA — BIOSEGURIDAD (30 min)\n\nTras la cirugía de:\n  • Paciente: ${conf.r.nom}\n  • Fin cirugía: ${finConf}\n  • Sala disponible a las: ${finLimp}`
        : `⛔ CONFLICTO DE HORARIO\n\n  • Sala: ${SN[sala]}\n  • Paciente en sala: ${conf.r.nom}\n  • Hora: ${h12(conf.r.hora)} → ${finConf}\n  • Limpieza hasta: ${finLimp}`;
      if (!window.confirm(detalle + '\n\n¿Desea agregar de todas formas?')) return;
    }

    const nuevo = {
      id:        ++idC.current,
      fecha:     form.fecha,
      hora:      form.hora,
      sala,
      nom:       nom.toUpperCase(),
      edad:      parseInt(form.edad) || null,
      cedula:    form.cedula || (pacSel?.cedula ?? ''),
      pac_id:    pacSel?.id || null,
      cir:       cir.toUpperCase(),
      dr:        dr.toUpperCase(),
      ayu:       (busqDr.fay || form.ayu).trim().toUpperCase(),
      ane:       (busqDr.fan || form.ane).trim().toUpperCase(),
      ped:       (busqDr.fped || form.ped).trim().toUpperCase() || '',
      tipo:      form.tipo,
      tpo,
      obs:       form.obs.trim(),
      estado:    'programado',
      tel_pac:   form.tel_pac.trim(),
      tel_dr:    form.tel_dr.trim(),
      email_pac: form.email_pac.trim(),
      email_dr:  form.email_dr.trim(),
    };

    setRegistros((prev) => [...prev, nuevo]);

    // Log SQL-ready (Juan Diego: descomentar fetch cuando el backend esté listo)
    console.group('%c MANFHER SYSTEMS — syncToDatabase()', 'color:#2a9d8f;font-weight:800;font-size:12px;');
    console.log('%c Tabla destino: operatory_schedule', 'color:#5a7a96;');
    console.table(buildPayload(nuevo));
    console.groupEnd();
    /*
    fetch('/api/operatory_schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(nuevo)),
    })
      .then((r) => r.json())
      .then((d) => showToast('✅ Guardado en BD — ID: ' + d.schedule_id))
      .catch(() => showToast('⚠ Sin conexión a BD — guardado localmente', 'err'));
    */

    limpiarFormulario();
    showToast('✅ Registro guardado · JSON SQL generado (ver Consola)');
  };

  // ════════════════════════════════════════════════════════════
  // CRUD — ELIMINAR
  // ════════════════════════════════════════════════════════════
  const eliminarCirugia = (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    setRegistros((prev) => prev.filter((r) => r.id !== id));
    showToast('Registro eliminado');
  };

  // ════════════════════════════════════════════════════════════
  // CRUD — EDITAR (modal)
  // ════════════════════════════════════════════════════════════
  const abrirEditar  = (r) => setEditRec({ ...r });
  const cerrarEditar = () => setEditRec(null);

  const guardarEdicion = () => {
    if (!editRec) return;
    const conf = getConflicto(registros, editRec.sala, editRec.hora, editRec.tpo, editRec.id, editRec.fecha);
    if (conf) {
      const finConf = h12(minToHora(conf.rf));
      const finLimp = h12(minToHora(conf.rf_limpieza));
      const detalle = conf.esSalaSucia
        ? `🧹 SALA EN LIMPIEZA (30 min)\n\nFin cirugía: ${finConf} → Sala libre: ${finLimp}`
        : `⛔ CONFLICTO\n\n  • ${conf.r.nom}\n  • ${h12(conf.r.hora)} → ${finConf}\n  • Limpieza: ${finLimp}`;
      if (!window.confirm(detalle + '\n\n¿Guardar de todas formas?')) return;
    }
    setRegistros((prev) =>
      prev.map((r) =>
        r.id === editRec.id
          ? { ...editRec, nom: editRec.nom.toUpperCase(), cir: editRec.cir.toUpperCase(), dr: editRec.dr.toUpperCase() }
          : r
      )
    );
    cerrarEditar();
    showToast('✅ Registro actualizado');
  };

  // ════════════════════════════════════════════════════════════
  // LIMPIAR FORMULARIO
  // ════════════════════════════════════════════════════════════
  const limpiarFormulario = () => {
    setForm({ ...FORM_VACIO, fecha: fechaActiva });
    setBusqPac(''); setSugerPac([]);
    setBusqDr({ fd: '', fay: '', fan: '', fped: '' });
    setSugerDr({ fd: [], fay: [], fan: [], fped: [] });
    setPacSel(null);
    setCedulaFb('');
    setBloqueoWarn('');
  };

  // ════════════════════════════════════════════════════════════
  // FARMACIA
  // ════════════════════════════════════════════════════════════
  const agregarFarmPedido = () => {
    if (!farmForm.item.trim()) { showToast('Ingrese el medicamento o insumo', 'err'); return; }
    const nuevo = { id: ++farmIdC.current, ...farmForm, fecha: fechaActiva, estado: 'pendiente' };
    setFarmPedidos((prev) => [...prev, nuevo]);
    setFarmForm({ item: '', cant: '', pac: '', prio: 'norm' });
    showToast('🏥 Pedido enviado a Farmacia');
  };

  const toggleFarmOk  = (id) => setFarmPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: p.estado === 'ok' ? 'pendiente' : 'ok' } : p));
  const elimFarmPedido = (id) => setFarmPedidos((prev) => prev.filter((p) => p.id !== id));

  // ════════════════════════════════════════════════════════════
  // EXPORTAR CSV
  // ════════════════════════════════════════════════════════════
  const exportarCSV = () => {
    const L = salaFiltro === 0 ? cxDelDia : cxDelDia.filter((r) => r.sala === salaFiltro);
    const f = new Date(fechaActiva + 'T12:00').toLocaleDateString('es-EC');
    let c = `Parte Operatorio — Clínicas Atlas — ${f}\nHora,Paciente,Edad,Cirugía,Cirujano,Ayudante,Anestesiólogo,Tipo,Tiempo(h),Sala,Estado\n`;
    L.forEach((r) => { c += `"${r.hora}","${r.nom}","${r.edad || ''}","${r.cir}","${r.dr}","${r.ayu}","${r.ane}","${r.tipo}","${r.tpo}","${SN[r.sala]}","${r.estado}"\n`; });
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(c);
    a.download = `parte_op_${fechaActiva}.csv`;
    a.click();
    showToast('📊 CSV exportado');
  };

  // ════════════════════════════════════════════════════════════
  // RECORDATORIOS
  // ════════════════════════════════════════════════════════════
  const msgPac = (r) => {
    const fecha = new Date(r.fecha + 'T12:00').toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' });
    return `Estimado/a ${r.nom}, le recordamos su cirugía de *${r.cir}* programada para el *${fecha}* a las *${h12(r.hora)}* en Clínicas Atlas. Por favor llegue 1 hora antes. Consultas: 02-XXXXXXX`;
  };
  const msgDr = (r) => {
    const fecha = new Date(r.fecha + 'T12:00').toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' });
    return `Dr. ${r.dr}, recordatorio: cirugía *${r.cir}* — Paciente: *${r.nom}* — Fecha: *${fecha} ${h12(r.hora)}* — ${SN[r.sala]} — Clínicas Atlas`;
  };

  const enviarWA = (tel, msg) => {
    if (!tel) { showToast('Sin número de teléfono registrado', 'err'); return; }
    window.open(`https://wa.me/593${tel.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('💬 Abriendo WhatsApp...');
  };
  const enviarEmail = (email, subj, body) => {
    if (!email) { showToast('Sin email registrado', 'err'); return; }
    window.open(`mailto:${email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`, '_blank');
    showToast('✉️ Abriendo cliente de email...');
  };

  // ════════════════════════════════════════════════════════════
  // HORARIOS GRID — estado de cada slot
  // ════════════════════════════════════════════════════════════
  const estadoSlot = (sala, horaStr) => {
    const ini = horaToMin(horaStr);
    const fin = ini + 30;
    for (const r of registros.filter((r) => r.fecha === horariosFecha && r.sala === sala)) {
      const ri  = horaToMin(r.hora);
      const rf  = ri + Math.round(r.tpo * 60);
      const rfl = rf + SALA_SUCIA_MIN;
      if (ini < rf  && fin > ri)  return { tipo: 'ocupado',  nom: r.nom };
      if (ini >= rf && ini < rfl) return { tipo: 'limpieza' };
    }
    return { tipo: 'libre' };
  };

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="parte-operatorio">
      {/* TOAST */}
      <div className={`toast-notification${toast.visible ? ' show' : ''}${toast.tipo === 'err' ? ' err' : ''}`}>
        {toast.msg}
      </div>

      {/* MODAL ACCESO */}
      {bloqueado && (
        <div className="access-modal">
          <div className="access-box">
            <div className="access-hdr">
              <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔐</div>
              <div style={{ fontWeight: 800, color: 'white' }}>PARTE OPERATORIO</div>
              <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Clínicas Atlas · MANFHER SYSTEMS</div>
            </div>
            <div className="access-body">
              <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--muted)', marginBottom: '4px' }}>
                Ingrese el código de administración para editar
              </p>
              <div className="access-pin">
                {pin.map((d, i) => (
                  <input
                    key={i} id={`pin-${i}`} type="password" maxLength="1"
                    value={d} inputMode="numeric"
                    onChange={(e) => manejarPin(e.target.value, i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`pin-${i - 1}`)?.focus();
                      if (e.key === 'Enter') verificarAcceso();
                    }}
                  />
                ))}
              </div>
              {errorPin && <div className="access-error">{errorPin}</div>}
              <button className="access-btn" onClick={verificarAcceso}>🔓 Ingresar como Administrador</button>
              <button
                style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '.84rem', color: 'var(--muted)', cursor: 'pointer' }}
                onClick={entrarSoloLectura}
              >
                👁 Solo lectura — Ver parte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editRec && (
        <div className="mov open" onClick={(e) => { if (e.target === e.currentTarget) cerrarEditar(); }}>
          <div className="mbx">
            <div className="mhdr">
              <div className="chi">✏️</div>
              <span className="cht">Editar Registro</span>
              <button className="bxm" onClick={cerrarEditar}>✕</button>
            </div>
            <div className="mbody">
              {[
                ['hora',  'Hora (HH:MM)', 'text'],
                ['nom',   'Paciente',     'text'],
                ['edad',  'Edad',         'number'],
                ['cir',   'Cirugía',      'text'],
                ['dr',    'Cirujano',     'text'],
                ['ayu',   'Ayudante',     'text'],
                ['ane',   'Anestesiólogo','text'],
              ].map(([campo, label, tipo]) => (
                <div key={campo}>
                  <label className="fl">{label.toUpperCase()}</label>
                  <input className="fi" type={tipo} value={editRec[campo] || ''}
                    onChange={(e) => setEditRec((r) => ({ ...r, [campo]: e.target.value }))} />
                </div>
              ))}
              <div className="g2">
                <div>
                  <label className="fl">TIPO</label>
                  <select className="fs" value={editRec.tipo}
                    onChange={(e) => setEditRec((r) => ({ ...r, tipo: e.target.value }))}>
                    {TIPOS_CX.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">TIEMPO (H)</label>
                  <input className="fi" type="number" step="0.5" min="0.5" value={editRec.tpo}
                    onChange={(e) => setEditRec((r) => ({ ...r, tpo: parseFloat(e.target.value) || 1 }))} />
                </div>
              </div>
              <div>
                <label className="fl">SALA</label>
                <select className="fs" value={editRec.sala}
                  onChange={(e) => setEditRec((r) => ({ ...r, sala: parseInt(e.target.value) }))}>
                  {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>{SN[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">ESTADO</label>
                <select className="fs" value={editRec.estado || 'programado'}
                  onChange={(e) => setEditRec((r) => ({ ...r, estado: e.target.value }))}>
                  {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.lbl}</option>)}
                </select>
              </div>
              {modoAdmin && (
                <div>
                  <label className="fl" style={{ color: 'var(--red)' }}>🔒 OBSERVACIONES / ALERGIAS</label>
                  <input className="fi" style={{ borderColor: 'var(--red-mid)' }} value={editRec.obs || ''}
                    onChange={(e) => setEditRec((r) => ({ ...r, obs: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="bmo" onClick={cerrarEditar}>Cancelar</button>
              <button className="bms" onClick={guardarEdicion}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ CONTENIDO PRINCIPAL ════ */}
      <div className="app-container">

        {/* HEADER */}
        <header className="hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 44 44" width="38" height="38">
              <rect width="44" height="44" rx="9" fill="#0f2440" />
              <text x="22" y="30" fontFamily="Georgia,serif" fontSize="24" fontWeight="bold" fill="#4db6ac" textAnchor="middle">A</text>
            </svg>
            <div>
              <div className="brand">Clínicas <span>ATLAS</span></div>
              <div style={{ fontSize: '.52rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>Sistema de Gestión Médica</div>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="hdr-title">Parte Operatorio</div>
          </div>
          {modoAdmin && (
            <span style={{ padding: '4px 10px', background: 'var(--green-l)', border: '1px solid var(--green-mid)', borderRadius: '8px', fontSize: '.72rem', fontWeight: 700, color: 'var(--green)' }}>
              🔓 Admin
            </span>
          )}
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textAlign: 'right', lineHeight: 1.8, whiteSpace: 'pre' }}>
            {reloj}
          </div>
          <button className="hdr-btn" onClick={exportarCSV}>📊 CSV</button>
          <button className="hdr-btn hdr-btn-teal" onClick={() => window.print()}>🖨️ Imprimir</button>
        </header>

        <main className="app">

          {/* QUIRÓFANOS */}
          <div className="salas-card">
            <div className="sec-lbl">Quirófanos y Salas</div>
            <div className="salas-grid">
              {['TODAS', 'SALA OP. 1', 'SALA OP. 2', 'SALA OP. 3', 'SALA OP. 4', 'HOSP. DÍA', 'ENDOSCOPÍA'].map((nom, i) => (
                <button key={i} className={`sala-btn ${salaFiltro === i ? 'active' : ''}`} onClick={() => setSalaFiltro(i)}>
                  {nom}
                  <span className="sc">{contPorSala(i)} cirugía{contPorSala(i) !== 1 ? 's' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FECHA NAVIGATOR */}
          <div className="fecha-nav">
            <span className="fecha-nav-lbl">📅 FECHA DEL PARTE</span>
            <button className="btn-fecha" onClick={() => cambiarFecha(-1)}>◀</button>
            <input type="date" className="fi-date" value={fechaActiva}
              onChange={(e) => setFechaActiva(e.target.value)} />
            <span className={`fecha-display${fechaActiva === HOY ? ' hoy' : ''}`}>
              {labelFecha(fechaActiva)}
            </span>
            <button className="btn-fecha" onClick={() => cambiarFecha(1)}>▶</button>
            {fechaActiva !== HOY && (
              <button className="badge-hoy" onClick={() => setFechaActiva(HOY)}>HOY</button>
            )}
          </div>

          {/* MAIN GRID */}
          <div className={`main-grid${modoAdmin ? '' : ' main-grid-full'}`}>

            {/* TABLA */}
            <div className="card">
              <div className="card-hdr">
                <div className="chi">📋</div>
                <span className="cht">{SN[salaFiltro]}</span>
                <span className="tbl-fecha">{labelFecha(fechaActiva)}</span>
              </div>
              <div className="stats-row">
                <div className="schip"><div className="sdot" style={{ background: 'var(--teal)' }} />Total:<strong>{stats.total}</strong></div>
                <div className="schip"><div className="sdot" style={{ background: 'var(--teal-mid)' }} />Lap.:<strong>{stats.lap}</strong></div>
                <div className="schip"><div className="sdot" style={{ background: 'var(--amber)' }} />Abierta:<strong>{stats.ab}</strong></div>
                <div className="schip"><div className="sdot" style={{ background: 'var(--navy)' }} />Endosc.:<strong>{stats.en}</strong></div>
                <div className="schip"><div className="sdot" style={{ background: 'var(--green)' }} />Otros:<strong>{stats.otros}</strong></div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hora</th><th>Paciente</th><th>Edad</th><th>Cirugía</th>
                      <th>Cirujano</th><th>Ayudante</th><th>Anestesiólogo</th>
                      <th>Tipo</th><th>T.h</th><th>Sala</th><th>Estado</th>
                      {modoAdmin && <th>Obs.</th>}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cxFiltrados.length === 0 ? (
                      <tr className="er">
                        <td colSpan={modoAdmin ? 13 : 12}>Sin cirugías programadas para este día en esta vista</td>
                      </tr>
                    ) : (
                      cxFiltrados.map((r) => {
                        const est     = ESTADOS[r.estado || 'programado'] || ESTADOS.programado;
                        const finHora = h12(minToHora(horaToMin(r.hora) + Math.round(r.tpo * 60)));
                        return (
                          <tr key={r.id}>
                            <td className="hc">
                              {h12(r.hora)}
                              <br />
                              <span style={{ fontSize: '.62rem', color: 'var(--teal-d)', fontWeight: 600, background: 'var(--teal-l)', padding: '1px 5px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
                                → {finHora}
                              </span>
                            </td>
                            <td className="nc">{r.nom}</td>
                            <td style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}>{r.edad || '—'}</td>
                            <td style={{ fontWeight: 600, color: 'var(--navy-mid)' }}>{r.cir}</td>
                            <td className="dc">{r.dr}</td>
                            <td className="dc">{r.ayu || '—'}</td>
                            <td className="dc">{r.ane || '—'}</td>
                            <td><span className={`tbadge ${tcls(r.tipo)}`}>{r.tipo}</span></td>
                            <td style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}>{r.tpo}h</td>
                            <td className="sc2">{SS[r.sala]}</td>
                            <td><span className={`estado-badge ${est.cls}`}>{est.icon} {est.lbl}</span></td>
                            {modoAdmin && (
                              <td style={{ fontSize: '.71rem', color: 'var(--muted)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.obs || ''}>
                                {r.obs || '—'}
                              </td>
                            )}
                            <td>
                              {modoAdmin && (
                                <div className="abw">
                                  <button className="be" onClick={() => abrirEditar(r)} title="Editar">✏️</button>
                                  <button className="bd" onClick={() => eliminarCirugia(r.id)} title="Eliminar">✕</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FORMULARIO — solo en modo admin */}
            {modoAdmin && (
              <div className="form-card">
                <div className="fhdr">
                  <div className="chi">➕</div>
                  <span className="cht">Nueva Cirugía</span>
                </div>
                <div className="fbody">

                  <label className="fl">FECHA DEL PROCEDIMIENTO</label>
                  <input className="fi" type="date" value={form.fecha}
                    onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />

                  <div className="g2">
                    {/* Selector de hora con indicador de bloqueo */}
                    <div>
                      <label className="fl">HORA <span style={{ fontSize: '.55rem', color: 'var(--muted)' }}>(🔴=BLOQUEADA)</span></label>
                      <select className="fs-hora" value={form.hora}
                        onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}>
                        {HORAS_GRID.map((h) => {
                          const conf = getConflicto(registros, Number(form.sala), h, parseFloat(form.tpo) || 1, null, form.fecha);
                          const label = conf
                            ? conf.esSalaSucia ? `${h12(h)} 🟡 LIMPIEZA` : `${h12(h)} 🔴 OCUPADO`
                            : h12(h);
                          return <option key={h} value={h}>{label}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="fl">SALA</label>
                      <select className="fs" value={form.sala}
                        onChange={(e) => setForm((f) => ({ ...f, sala: parseInt(e.target.value) }))}>
                        {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>{SN[s]}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Advertencia sala sucia */}
                  {bloqueoWarn && <div className="bloqueo-warn show">⛔ {bloqueoWarn}</div>}

                  {/* Buscador paciente */}
                  <label className="fl">PACIENTE *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="fi" placeholder="Buscar por apellido, nombre o cédula..."
                      value={busqPac} autoComplete="off"
                      onChange={(e) => buscarPaciente(e.target.value)}
                      onBlur={() => setTimeout(() => setSugerPac([]), 200)} />
                    {sugerPac.length > 0 && (
                      <div className="pac-drop open">
                        {sugerPac.map((p) => (
                          <div key={p.id} className="pac-opt" onMouseDown={() => seleccionarPaciente(p)}>
                            <div>
                              <div className="pac-opt-nom">{p.nom}</div>
                              <div className="pac-opt-det">CI: {p.cedula} · Edad: {p.edad}{p.alergias ? ` · ⚠ ${p.alergias}` : ''}</div>
                            </div>
                            <span className="pac-opt-badge">Registrado</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {pacSel && (
                    <div className="pac-found-chip">
                      ✅ {pacSel.nom} · CI: {pacSel.cedula} · 📞 {pacSel.tel}
                      <button onClick={limpiarPaciente}>✕</button>
                    </div>
                  )}

                  {/* Edad y Cédula (solo si no hay paciente de DB) */}
                  {!pacSel && (
                    <div className="g2">
                      <div>
                        <label className="fl">EDAD</label>
                        <input className="fi" type="number" placeholder="—" min="0" value={form.edad}
                          onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))} />
                      </div>
                      <div>
                        <label className="fl">CÉDULA</label>
                        <input className="fi" type="text" placeholder="1700000000" value={form.cedula}
                          style={{ borderColor: cedulaFb ? (cedulaFb.includes('✓') ? 'var(--green)' : 'var(--red)') : '' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((f) => ({ ...f, cedula: val }));
                            if (val) { const r = validarCedula(val); setCedulaFb(r.msg); } else setCedulaFb('');
                          }} />
                        {cedulaFb && (
                          <span style={{ fontSize: '.65rem', color: cedulaFb.includes('✓') ? 'var(--green)' : 'var(--red)' }}>{cedulaFb}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <label className="fl">CIRUGÍA / PROCEDIMIENTO *</label>
                  <input className="fi" placeholder="Nombre del procedimiento" value={form.cir}
                    onChange={(e) => setForm((f) => ({ ...f, cir: e.target.value }))} />

                  {/* Buscadores de médicos */}
                  {[
                    { campo: 'fd',   label: 'CIRUJANO PRINCIPAL *',  ph: 'Buscar médico por nombre o especialidad...' },
                    { campo: 'fay',  label: 'AYUDANTE / ASISTENTE',  ph: 'Buscar médico...' },
                    { campo: 'fan',  label: 'ANESTESIÓLOGO',         ph: 'Buscar anestesiólogo...' },
                    { campo: 'fped', label: 'PEDIATRA (SI APLICA)',   ph: 'Buscar pediatra...' },
                  ].map(({ campo, label, ph }) => (
                    <div key={campo} style={{ position: 'relative' }}>
                      <label className="fl">{label}</label>
                      <input className="fi" placeholder={ph} value={busqDr[campo]} autoComplete="off"
                        onChange={(e) => buscarMedico(campo, e.target.value)}
                        onBlur={() => setTimeout(() => setSugerDr((s) => ({ ...s, [campo]: [] })), 200)} />
                      {sugerDr[campo].length > 0 && (
                        <div className="pac-drop open">
                          {sugerDr[campo].map((m) => (
                            <div key={m.id} className="pac-opt" onMouseDown={() => seleccionarMedico(campo, m)}>
                              <div>
                                <div className="pac-opt-nom">{m.nom}</div>
                                <div className="pac-opt-det">{m.esp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="g2">
                    <div>
                      <label className="fl">TIPO DE CIRUGÍA</label>
                      <select className="fs" value={form.tipo}
                        onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                        {TIPOS_CX.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="fl">TIEMPO (H)</label>
                      <input className="fi" type="number" step="0.5" min="0.5" placeholder="1"
                        value={form.tpo} onChange={(e) => setForm((f) => ({ ...f, tpo: e.target.value }))} />
                    </div>
                  </div>

                  <label className="fl" style={{ color: 'var(--red)' }}>
                    🔒 OBSERVACIONES / ALERGIAS <span style={{ fontSize: '.5rem' }}>— USO EXCLUSIVO QUIRÓFANO</span>
                  </label>
                  <input className="fi" style={{ borderColor: 'var(--red-mid)' }}
                    placeholder="ORH+, alergias, indicaciones especiales..." value={form.obs}
                    onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))} />

                  <div style={{ paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>📞 CONTACTO PARA RECORDATORIOS</div>
                    <div className="g2">
                      <input className="fi" placeholder="Tel. Paciente" value={form.tel_pac}
                        onChange={(e) => setForm((f) => ({ ...f, tel_pac: e.target.value }))} />
                      <input className="fi" placeholder="Tel. Médico" value={form.tel_dr}
                        onChange={(e) => setForm((f) => ({ ...f, tel_dr: e.target.value }))} />
                    </div>
                    <div className="g2" style={{ marginTop: '5px' }}>
                      <input className="fi" placeholder="Email Paciente" value={form.email_pac}
                        onChange={(e) => setForm((f) => ({ ...f, email_pac: e.target.value }))} />
                      <input className="fi" placeholder="Email Médico" value={form.email_dr}
                        onChange={(e) => setForm((f) => ({ ...f, email_dr: e.target.value }))} />
                    </div>
                  </div>

                  <div className="ffoot" style={{ marginTop: '10px' }}>
                    <button className="badd" onClick={agregarCirugia}>➕ Agregar al Parte</button>
                    <button className="bclr" onClick={limpiarFormulario}>Limpiar</button>
                  </div>
                </div>
              </div>
            )}
          </div>{/* /main-grid */}

          {/* FARMACIA */}
          <div className="farm-card" style={{ marginTop: '16px' }}>
            <div className="card-hdr" style={{ background: 'linear-gradient(135deg,var(--amber),#975a16)' }}>
              <div className="chi">🏥</div>
              <span className="cht">Pedidos Especiales a Farmacia</span>
              <span style={{ marginLeft: 'auto', fontSize: '.66rem', color: 'rgba(255,255,255,.6)' }}>Insumos y medicamentos especiales por cirugía</span>
            </div>
            <div>
              {farmPedidos.filter((p) => p.fecha === fechaActiva).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--dim)', fontSize: '.8rem', fontStyle: 'italic' }}>Sin pedidos para este día</div>
              ) : (
                farmPedidos.filter((p) => p.fecha === fechaActiva).map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--surface2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: p.prio === 'urg' ? 'var(--red)' : 'var(--amber)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>{p.item}{p.cant ? ` — ${p.cant}` : ''}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{p.pac ? `Cirugía: ${p.pac} · ` : ''}Estado: {p.estado === 'ok' ? '✅ Confirmado' : '⏳ Pendiente'}</div>
                    </div>
                    <span className={`farm-badge ${p.prio === 'urg' ? 'fb-urg' : 'fb-norm'}`}>{p.prio === 'urg' ? 'Urgente' : 'Normal'}</span>
                    <button onClick={() => toggleFarmOk(p.id)} style={{ padding: '3px 9px', borderRadius: 5, background: p.estado === 'ok' ? 'var(--green-l)' : 'var(--surface2)', border: `1px solid ${p.estado === 'ok' ? 'var(--green-mid)' : 'var(--border)'}`, color: p.estado === 'ok' ? 'var(--green)' : 'var(--muted)', fontSize: '.7rem', cursor: 'pointer' }}>✓</button>
                    {modoAdmin && <button onClick={() => elimFarmPedido(p.id)} style={{ padding: '3px 7px', borderRadius: 5, background: 'var(--red-l)', border: '1px solid var(--red-mid)', color: 'var(--red)', fontSize: '.7rem', cursor: 'pointer' }}>✕</button>}
                  </div>
                ))
              )}
            </div>
            {modoAdmin && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--surface)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: '160px' }}>
                  <label className="fl" style={{ color: 'var(--amber)' }}>Medicamento / Insumo</label>
                  <input className="fi" placeholder="Nombre del medicamento o insumo especial" value={farmForm.item}
                    onChange={(e) => setFarmForm((f) => ({ ...f, item: e.target.value }))} />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label className="fl" style={{ color: 'var(--amber)' }}>Cantidad</label>
                  <input className="fi" placeholder="Ej: 2 amp, 1 kit" value={farmForm.cant}
                    onChange={(e) => setFarmForm((f) => ({ ...f, cant: e.target.value }))} />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label className="fl" style={{ color: 'var(--amber)' }}>Cirugía / Paciente</label>
                  <input className="fi" placeholder="Referencia" value={farmForm.pac}
                    onChange={(e) => setFarmForm((f) => ({ ...f, pac: e.target.value }))} />
                </div>
                <div style={{ minWidth: '90px' }}>
                  <label className="fl" style={{ color: 'var(--amber)' }}>Prioridad</label>
                  <select className="fs" value={farmForm.prio}
                    onChange={(e) => setFarmForm((f) => ({ ...f, prio: e.target.value }))}>
                    <option value="urg">🔴 Urgente</option>
                    <option value="norm">🟡 Normal</option>
                  </select>
                </div>
                <button onClick={agregarFarmPedido}
                  style={{ padding: '0 15px', height: 32, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                  + Agregar Pedido
                </button>
              </div>
            )}
          </div>

          {/* HORARIOS DISPONIBLES */}
          <div className="horarios-card">
            <div className="card-hdr">
              <div className="chi">🕐</div>
              <span className="cht">HORARIOS DISPONIBLES POR SALA — {labelFecha(horariosFecha)}</span>
            </div>
            <div className="horarios-day-nav">
              {Array.from({ length: 7 }, (_, i) => {
                const d = fechaHoy(); d.setDate(d.getDate() + i);
                const fk = fechaKey(d);
                const esHoy = i === 0;
                const label = esHoy ? 'HOY' : d.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase();
                const n = registros.filter((r) => r.fecha === fk).length;
                return (
                  <button key={fk} className={`day-pill${esHoy ? ' hoy-pill' : ''}${horariosFecha === fk ? ' active' : ''}`}
                    onClick={() => setHorariosFecha(fk)}>
                    {label}{n > 0 ? ` (${n})` : ''}
                  </button>
                );
              })}
              <div className="horarios-legend" style={{ marginLeft: 'auto' }}>
                <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--green)' }} /> Libre</div>
                <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--amber)' }} /> Limpieza</div>
                <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--red)' }} /> Ocupado</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="horarios-grid" style={{ minWidth: '900px' }}>
                {[1, 2, 3, 4, 5, 6].map((salaId) => (
                  <div key={salaId} className="sala-col">
                    <div className="sala-col-hdr">{SS[salaId]}</div>
                    {HORAS_GRID.map((horaStr) => {
                      const s = estadoSlot(salaId, horaStr);
                      return (
                        <div key={horaStr} className={`hora-slot ${s.tipo}`}>
                          <div className="slot-info">
                            {s.tipo === 'ocupado'  && <>{`🔴 ${(s.nom || '').split(' ')[0]}`}</>}
                            {s.tipo === 'limpieza' && <>🧹 LIMPIEZA</>}
                            {s.tipo === 'libre'    && <>✅ {h12(horaStr)}</>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECORDATORIOS */}
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
                    {/* Fila paciente */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--surface2)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                          {r.nom} <span style={{ fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>— Paciente</span>
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.cir} · {h12(r.hora)} · {SN[r.sala]}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--navy)', marginTop: 3 }}>📞 {r.tel_pac || 'Sin teléfono'}</div>
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
                    {/* Fila médico */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--surface2)', background: 'var(--navy-l)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨‍⚕️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                          {r.dr} <span style={{ fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>— Cirujano</span>
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.cir} · {r.nom} · {h12(r.hora)}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--navy)', marginTop: 3 }}>📞 {r.tel_dr || 'Sin teléfono'}</div>
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

          {/* BARRA INFERIOR */}
          <div className="btm">
            <div className="bts">
              <div className="bts-s">
                <span className="bts-l">Fecha</span>
                <span className="bts-v">{new Date(fechaActiva + 'T12:00').toLocaleDateString('es-EC')}</span>
              </div>
              <div className="bts-s">
                <span className="bts-l">Cirugías del día</span>
                <span className="bts-v">{cxDelDia.length}</span>
              </div>
              <div className="bts-s">
                <span className="bts-l">Vista</span>
                <span className="bts-v">{SS[salaFiltro]}</span>
              </div>
              <div className="bts-s">
                <span className="bts-l">Modo</span>
                <span className="bts-v" style={{ color: modoAdmin ? 'var(--green-mid)' : 'var(--teal-mid)' }}>
                  {modoAdmin ? '🔓 Admin' : '👁 Lectura'}
                </span>
              </div>
            </div>
            <div className="bta">
              <button className="bbt" onClick={exportarCSV}>📊 CSV</button>
              <button className="bbt" onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ParteOperatorio;
