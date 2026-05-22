import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/ParteOperatorio.css';
import {
  ADMIN_PIN,
  DEMO_REGISTROS,
  FORM_VACIO,
  HORAS_GRID,
  HOY,
  MEDICOS_DB,
  PACIENTES_DB,
  SN,
  SS,
  TIPOS_CX,
  demoIdCounter,
} from './data/parteOperatorioData';
import { buildPayload } from './services/parteOperatorioService';
import AccessModal from './components/AccessModal';
import EditRegistroModal from './components/EditRegistroModal';
import FarmaciaSection from './components/FarmaciaSection';
import ParteTable from './components/ParteTable';
import HorariosDisponibles from './components/HorariosDisponibles';
import RecordatoriosSection from './components/RecordatoriosSection';
import { useReloj } from './hooks/useReloj';
import {
  SALA_SUCIA_MIN,
  fechaKey,
  getConflicto,
  h12,
  horaToMin,
  minToHora,
  validarCedula,
} from './utils/parteOperatorioUtils';

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
  const reloj = useReloj();

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
  const idC = useRef(demoIdCounter);

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
        <AccessModal
          pin={pin}
          errorPin={errorPin}
          manejarPin={manejarPin}
          verificarAcceso={verificarAcceso}
          entrarSoloLectura={entrarSoloLectura}
        />
      )}

      {/* MODAL EDITAR */}
      {editRec && (
        <EditRegistroModal
          editRec={editRec}
          setEditRec={setEditRec}
          modoAdmin={modoAdmin}
          cerrarEditar={cerrarEditar}
          guardarEdicion={guardarEdicion}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="app-container">

        {/* HEADER */}
        <header className="hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="flex flex-col">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Logo"
              className="w-44"
            />
           
          </div>
            <div>
              
              <div style={{ fontSize: '.52rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>Sistema de Gestión Médica</div>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="hdr-title">Parte Operatorio</div>
          </div>
          {modoAdmin && (
            <span style={{ color: '#000000', padding: '4px 10px', background: '#69c9ba', border: '1px solid var(--green-mid)', borderRadius: '8px', fontSize: '.72rem', fontWeight: 700, color: 'var(--green)' }}>
              🔓 Admin
            </span>
          )}
          <div style={{color: '#000000', padding: '4px 10px', background: '#69c9ba', border: '1px solid var(--green-mid)', borderRadius: '8px', fontSize: '.72rem', fontWeight: 700, color: 'var(--green)'  }}>
            {reloj}
          </div>
          <div className="btz">
              <button className="bbz" onClick={exportarCSV}>📊 CSV</button>
              <button className="bbz" onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>
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
            <ParteTable
              salaFiltro={salaFiltro}
              fechaActiva={fechaActiva}
              labelFecha={labelFecha}
              stats={stats}
              cxFiltrados={cxFiltrados}
              modoAdmin={modoAdmin}
              abrirEditar={abrirEditar}
              eliminarCirugia={eliminarCirugia}
            />

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

          {modoAdmin && (
            <FarmaciaSection
              farmPedidos={farmPedidos}
              fechaActiva={fechaActiva}
              modoAdmin={modoAdmin}
              farmForm={farmForm}
              setFarmForm={setFarmForm}
              agregarFarmPedido={agregarFarmPedido}
              toggleFarmOk={toggleFarmOk}
              elimFarmPedido={elimFarmPedido}
            />
          )}

          {modoAdmin && (
            <HorariosDisponibles
              horariosFecha={horariosFecha}
              setHorariosFecha={setHorariosFecha}
              registros={registros}
              estadoSlot={estadoSlot}
              labelFecha={labelFecha}
            />
          )}

          {modoAdmin && (
            <RecordatoriosSection
              cxDelDia={cxDelDia}
              enviarWA={enviarWA}
              enviarEmail={enviarEmail}
              msgPac={msgPac}
              msgDr={msgDr}
              showToast={showToast}
            />
          )}

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
