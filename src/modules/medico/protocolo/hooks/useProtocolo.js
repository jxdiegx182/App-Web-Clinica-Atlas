// ══════════════════════════════════════════════════════════════════
// ENTREGABLE 4 — HOOK useProtocolo
// Lógica de negocio migrada del HTML: cálculos, collectData, IA
// src/hooks/useProtocolo.js
// ══════════════════════════════════════════════════════════════════
import { useCallback, useMemo } from 'react';
import { useHCU } from '../store/hcuStore';
import { PROTOCOLO_ACTIONS } from '../store/protocoloStore';
import { CIE10_QUIRURGICO, CPT_DB, PATOLOGOS } from '../data/protocoloDB';

export function useProtocolo() {
  const { state, dispatch } = useHCU();
  const P = state.protocoloOperatorio;

  // ── Dispatch helpers (envuelven el dispatch raw) ──
  const proto = useMemo(() => ({
    setPaciente:          (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_PROTO_PACIENTE,   payload: data }),
    setTipoCirugia:       (t)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_TIPO_CIRUGIA,     payload: t }),
    setTipoAnestesia:     (t)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_TIPO_ANESTESIA,   payload: t }),

    addDxIngreso:         (dx)   => dispatch({ type: PROTOCOLO_ACTIONS.ADD_DX_INGRESO,       payload: dx }),
    removeDxIngreso:      (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_DX_INGRESO,    payload: c }),
    addDxOpPropuesta:     (dx)   => dispatch({ type: PROTOCOLO_ACTIONS.ADD_DX_OP_PROPUESTA,  payload: dx }),
    removeDxOpPropuesta:  (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_DX_OP_PROPUESTA, payload: c }),
    addDxPosop:           (dx)   => dispatch({ type: PROTOCOLO_ACTIONS.ADD_DX_POSOP,         payload: dx }),
    removeDxPosop:        (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_DX_POSOP,      payload: c }),
    addCIE10:             (dx)   => dispatch({ type: PROTOCOLO_ACTIONS.ADD_CIE10,            payload: dx }),
    removeCIE10:          (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_CIE10,         payload: c }),
    syncIngresoToCIE:     (dx)   => dispatch({ type: PROTOCOLO_ACTIONS.SYNC_INGRESO_TO_CIE, payload: dx }),
    removeSyncedCIE:      (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_SYNCED_CIE,   payload: c }),
    addCPT:               (p)    => dispatch({ type: PROTOCOLO_ACTIONS.ADD_CPT,              payload: p }),
    removeCPT:            (c)    => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_CPT,           payload: c }),

    setEquipo:            (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_EQUIPO,           payload: data }),
    setTiempoInicio:      (v)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_TIEMPO_INICIO,    payload: v }),
    setTiempoFin:         (v)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_TIEMPO_FIN,       payload: v }),
    setNarracion:         (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_NARRACION,        payload: data }),

    addInsumo:            (cat, nombre) => dispatch({ type: PROTOCOLO_ACTIONS.ADD_INSUMO,    payload: { cat, nombre } }),
    updateInsumo:         (id, field, value) => dispatch({ type: PROTOCOLO_ACTIONS.UPDATE_INSUMO, payload: { id, field, value } }),
    removeInsumo:         (id)   => dispatch({ type: PROTOCOLO_ACTIONS.REMOVE_INSUMO,        payload: id }),
    setInsumoFiltro:      (v)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_INSUMO_FILTRO,    payload: v }),
    updateConteo:         (data) => dispatch({ type: PROTOCOLO_ACTIONS.UPDATE_CONTEO,        payload: data }),

    setComplicaciones:    (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_COMPLICACIONES,   payload: data }),
    setMuestra:           (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_MUESTRA,          payload: data }),
    setPatologo:          (p)    => dispatch({ type: PROTOCOLO_ACTIONS.SET_PATOLOGO,         payload: p }),
    clearPatologo:        ()     => dispatch({ type: PROTOCOLO_ACTIONS.CLEAR_PATOLOGO }),
    setMuestraNotificada: ()     => dispatch({ type: PROTOCOLO_ACTIONS.SET_MUESTRA_NOTIFICADA }),

    setFirmaCirujano:     (data) => dispatch({ type: PROTOCOLO_ACTIONS.SET_FIRMA_CIRUJANO,   payload: data }),
    cargarPlantilla:      (tpl)  => dispatch({ type: PROTOCOLO_ACTIONS.CARGAR_PLANTILLA,     payload: tpl }),
    resetProtocolo:       ()     => dispatch({ type: PROTOCOLO_ACTIONS.RESET_PROTOCOLO }),
  }), [dispatch]);

  // ────────────────────────────────────────────────────────────────
  // LÓGICA DE NEGOCIO 1: collectData
  // Serializa el estado del protocolo para enviar a la IA o guardar
  // ────────────────────────────────────────────────────────────────
  const collectData = useCallback(() => {
    const formatCodes = (arr) => arr.length
      ? arr.map(x => x.c !== '—' ? `${x.c}: ${x.d}` : x.d).join(', ')
      : 'No especificado';

    return {
      // Paciente
      paciente:       P.paciente.nombres,
      id:             P.paciente.id,
      edad:           P.paciente.edad,
      alergia:        P.paciente.alergias,
      // Operación
      tipoCirugia:    P.operacion.tipoCirugia || 'No especificado',
      tipoAnestesia:  P.operacion.tipoAnestesia || 'No especificado',
      // Diagnósticos
      operacion:      formatCodes(P.diagnosticos.operacionPropuesta) || 'No especificado',
      diagPos:        formatCodes(P.diagnosticos.posoperatorio)       || 'No especificado',
      codigosCIE:     formatCodes(P.diagnosticos.cie10)               || 'Ninguno',
      codigosCPT:     formatCodes(P.procedimientosCPT)                || 'Ninguno',
      // Narración
      dieresis:       P.narracion.dieresis,
      exposicion:     P.narracion.exposicion,
      exploracion:    P.narracion.exploracion,
      procedimiento:  P.narracion.procedimiento,
      sintesis:       P.narracion.sintesis,
      // Equipo
      cirujano1:      P.equipoQuirurgico.cirujano1,
      tiempoTotal:    P.tiempos.duracion || '—',
      // Insumos
      equipos:        P.insumos.rows.length
        ? P.insumos.rows.map(r => r.nombre + (r.obs ? ` (${r.obs})` : '')).join(', ')
        : 'No especificado',
      // Completitud (para auditoría)
      completitud: {
        operacion:      P.diagnosticos.operacionPropuesta.length > 0,
        diagPos:        P.diagnosticos.posoperatorio.length > 0,
        dieresis:       !!P.narracion.dieresis,
        exposicion:     !!P.narracion.exposicion,
        exploracion:    !!P.narracion.exploracion,
        procedimiento:  !!P.narracion.procedimiento,
        sintesis:       !!P.narracion.sintesis,
        cie10:          P.diagnosticos.cie10.length > 0,
        cpt:            P.procedimientosCPT.length > 0,
        equipos:        P.insumos.rows.length > 0,
      },
    };
  }, [P]);

  // ────────────────────────────────────────────────────────────────
  // LÓGICA DE NEGOCIO 2: Asistente IA Quirúrgico
  // Migrado del runIA() original — usa la Anthropic API
  // ────────────────────────────────────────────────────────────────
  const runIA = useCallback(async (type) => {
    const d = collectData();
    const hasData = d.operacion !== 'No especificado' || d.procedimiento || d.exploracion;
    if (!hasData) return { error: 'Ingrese información quirúrgica antes de usar el asistente IA.' };

    const CONFIGS = {
      alertas: {
        label: 'Alertas y Errores del Protocolo',
        tag: 'ALERTAS',
        prompt: `Eres cirujano revisor experto. Analiza este protocolo y detecta errores, inconsistencias y riesgos.
Devuelve SOLO JSON: {"alertas":[{"nivel":"critico|advertencia|info|ok","titulo":"Título","descripcion":"Descripción"}]}

Paciente: ${d.paciente}
Alergia: ${d.alergia} ← CRÍTICO
Operación: ${d.operacion}
Diagnóstico Posop: ${d.diagPos}
Tipo: ${d.tipoCirugia}
CIE-10: ${d.codigosCIE}
CPT: ${d.codigosCPT}
Equipos: ${d.equipos}
Procedimiento: ${d.procedimiento || 'No completado'}
Síntesis: ${d.sintesis || 'No completado'}`,
      },
      cie_verify: {
        label: 'Verificación CIE-10',
        tag: 'CIE-10',
        prompt: `Experto en codificación ICD-10. Analiza los códigos CIE-10 de este protocolo.

Operación: ${d.operacion}
Diagnóstico Posoperatorio: ${d.diagPos}
Hallazgos: ${d.exploracion || 'No especificado'}
Códigos CIE-10: ${d.codigosCIE}

Evalúa: ✅ Validación · ❌ Errores · ➕ Faltantes · 🔄 Alternativos · 💡 Recomendación`,
      },
      cpt_verify: {
        label: 'Verificación CPT',
        tag: 'CPT',
        prompt: `Experto en codificación CPT quirúrgica.

Operación: ${d.operacion}
Procedimiento: ${d.procedimiento || 'No especificado'}
Tipo: ${d.tipoCirugia}
Códigos CPT: ${d.codigosCPT}

Analiza: ✅ Validación · ❌ Errores · ➕ Faltantes · 💰 Facturación · 🔄 Sugeridos · ⚠️ Alertas`,
      },
      resumen: {
        label: 'Resumen Ejecutivo',
        tag: 'RESUMEN',
        prompt: `Cirujano experto. Genera resumen operatorio profesional.

Paciente: ${d.paciente} | Edad: ${d.edad} | Alergia: ${d.alergia}
Operación: ${d.operacion} | Tipo: ${d.tipoCirugia} | Tiempo: ${d.tiempoTotal}
Hallazgos: ${d.exploracion || 'No especificado'}
Procedimiento: ${d.procedimiento || 'No especificado'}
Equipos: ${d.equipos}

Estructura: OPERACIÓN · HALLAZGOS · TÉCNICA · CIERRE · DIAGNÓSTICO FINAL · DURACIÓN. Máx 200 palabras.`,
      },
      alergia: {
        label: 'Control de Alergias',
        tag: 'ALERGIAS',
        prompt: `Farmacólogo clínico. Analiza alergias vs procedimiento.

Alergia: ${d.alergia}
Procedimiento: ${d.procedimiento || 'No especificado'}
Operación: ${d.operacion}

Evalúa: 🚨 Riesgo directo · 💊 Fármacos a EVITAR · ✅ Alternativas · 🔗 Reactividad cruzada · 📋 Protocolos`,
      },
      protocolo: {
        label: 'Revisión de Protocolo',
        tag: 'CALIDAD',
        prompt: `Auditor médico. Evalúa completitud del protocolo.

Campos:
Operación: ${d.completitud.operacion ? '✅' : '❌'}
Diagnóstico Posop: ${d.completitud.diagPos ? '✅' : '❌'}
Diéresis: ${d.completitud.dieresis ? '✅' : '❌'}
Exposición: ${d.completitud.exposicion ? '✅' : '❌'}
Hallazgos: ${d.completitud.exploracion ? '✅' : '❌'}
Procedimiento: ${d.completitud.procedimiento ? '✅' : '❌'}
Síntesis: ${d.completitud.sintesis ? '✅' : '❌'}
CIE-10: ${d.completitud.cie10 ? '✅' : '❌'}
CPT: ${d.completitud.cpt ? '✅' : '❌'}
Equipos: ${d.completitud.equipos ? '✅' : '❌'}

Evalúa: 📊 Score · ❌ Críticos faltantes · ⚠️ Recomendados · 📝 Calidad narrativa · ✅ Fortalezas · 🎯 Prioridades. Puntaje 1-10.`,
      },
    };

    const cfg = CONFIGS[type];
    if (!cfg) return { error: 'Tipo de análisis no reconocido.' };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: cfg.prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(c => c.text || '').join('') || 'Error al obtener respuesta.';

      if (type === 'alertas') {
        try {
          const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
          return { label: cfg.label, tag: cfg.tag, alertas: parsed.alertas || [], raw };
        } catch {
          return { label: cfg.label, tag: cfg.tag, raw };
        }
      }
      return { label: cfg.label, tag: cfg.tag, raw };
    } catch (e) {
      return { error: 'Error al conectar con la IA. Verifique su conexión.' };
    }
  }, [collectData]);

  // ────────────────────────────────────────────────────────────────
  // LÓGICA DE NEGOCIO 3: Sistema de Plantillas
  // localStorage con aislamiento por usuario
  // ────────────────────────────────────────────────────────────────
  const TPL_KEY = 'atlas_proto_users';

  const guardarPlantilla = useCallback((usuario, nombreTpl) => {
    try {
      const store = JSON.parse(localStorage.getItem(TPL_KEY) || '{}');
      if (!store[usuario]) store[usuario] = [];
      const tpl = {
        id: Date.now(),
        nombre: nombreTpl || `Protocolo ${new Date().toLocaleDateString('es-EC')}`,
        savedAt: new Date().toLocaleString('es-EC'),
        // Serializar el sub-estado completo del protocolo
        data: JSON.parse(JSON.stringify(P)),
      };
      store[usuario].unshift(tpl);
      if (store[usuario].length > 20) store[usuario].splice(20);
      localStorage.setItem(TPL_KEY, JSON.stringify(store));
      return { ok: true, tpl };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, [P]);

  const listarPlantillas = useCallback((usuario) => {
    try {
      const store = JSON.parse(localStorage.getItem(TPL_KEY) || '{}');
      return store[usuario] || [];
    } catch {
      return [];
    }
  }, []);

  const eliminarPlantilla = useCallback((usuario, tplId) => {
    try {
      const store = JSON.parse(localStorage.getItem(TPL_KEY) || '{}');
      if (store[usuario]) {
        store[usuario] = store[usuario].filter(t => t.id !== tplId);
        localStorage.setItem(TPL_KEY, JSON.stringify(store));
      }
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }, []);

  // ────────────────────────────────────────────────────────────────
  // LÓGICA DE NEGOCIO 4: Notificación al Patólogo (simulada)
  // En producción: reemplazar fetch con el endpoint real
  // ────────────────────────────────────────────────────────────────
  const enviarNotificacionPatologo = useCallback(async () => {
    const { patologo, tipo, piezas, diagPresuncion, urgencia } = P.muestra;
    if (!patologo) return { ok: false, error: 'Seleccione un patólogo.' };

    // Simular latencia de red
    await new Promise(r => setTimeout(r, 1000));

    // En producción: fetch POST al endpoint de notificaciones Atlas
    // const res = await fetch('/api/patologia/notificar', { method: 'POST', body: JSON.stringify({ patologo, muestra }) });

    proto.setMuestraNotificada();
    return {
      ok: true,
      msg: `Patólogo ${patologo.nombre} notificado correctamente · Urgencia: ${urgencia}`,
    };
  }, [P.muestra, proto]);

  // ────────────────────────────────────────────────────────────────
  // LÓGICA DE NEGOCIO 5: Datos derivados (memoizados)
  // ────────────────────────────────────────────────────────────────

  // Conteo de ítems para el badge del card
  const insumosCount = useMemo(() =>
    P.insumos.rows.length
      ? `${P.insumos.rows.length} ítem${P.insumos.rows.length !== 1 ? 's' : ''}`
      : '0 ítems',
    [P.insumos.rows.length]
  );

  // Score de completitud del protocolo (0-10)
  const scoreCompletitud = useMemo(() => {
    const c = collectData().completitud;
    const campos = Object.values(c);
    const completos = campos.filter(Boolean).length;
    return Math.round((completos / campos.length) * 10);
  }, [collectData]);

  // Códigos CIE sincronizados desde ingreso
  const ciesSincronizados = useMemo(() =>
    new Set(P.diagnosticos.cie10.filter(x => x.syncedFromIngreso).map(x => x.c)),
    [P.diagnosticos.cie10]
  );

  return {
    // Estado
    P,
    // Actions
    proto,
    // Lógica de negocio
    collectData,
    runIA,
    guardarPlantilla,
    listarPlantillas,
    eliminarPlantilla,
    enviarNotificacionPatologo,
    // Derivados
    insumosCount,
    scoreCompletitud,
    ciesSincronizados,
    // Constantes
    PATOLOGOS,
  };
}
