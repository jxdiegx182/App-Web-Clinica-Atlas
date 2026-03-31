// ══════════════════════════════════════════════════════
// STORE — MANFHER SYSTEMS · Atlas HIS
// Estado central del formulario Form. 005
// Patrón: useReducer + Context (listo para Redux/Zustand)
// ══════════════════════════════════════════════════════
import { createContext, useContext, useReducer, useCallback } from 'react';

// ── ESTADO INICIAL ──
const INITIAL_STATE = {
  // Datos del establecimiento
  institucion: 'MSP',
  establecimiento: 'Clínicas Atlas',
  unicodigo: '',

  // Datos del paciente
  paciente: {
    apellido1: '', apellido2: '',
    nombre1: '', nombre2: '',
    nombres: '',        // campo unificado para display
    hcl: '',            // N° Historia Clínica Única
    archivo: '',
    hoja: '1',
    sexo: '',
    edad: '',
    condicion_edad: '',
    fecha: new Date().toISOString().slice(0, 10),
    sala: '',
    cama: '',
    medico: '',
    dias: '',
    alergias: '',
  },

  // Signos vitales
  vitales: {
    pa: '', fc: '', fr: '', temp: '',
    spo2: '', glucosa: '', diuresis: '',
    hora: new Date().toTimeString().slice(0, 5),
    peso: '', talla: '',
    perimetro: '', talla_fetal: '',
    actividad: '', dieta: '',
  },

  // IMC calculado
  imc: {
    value: null,    // número
    label: '',      // 'Normal', 'Obesidad', etc.
    clase: '',      // 'imc-normal', 'imc-obeso', etc.
    alerta: '',
    pct: 0,         // posición en barra (0-100)
  },

  // SOABIE
  soabie: {
    subjetivo: '', objetivo: '', analisis: '',
    bienestar: '', intervenciones: '', evaluacion: '',
    enfermeria: '', observaciones: '',
  },

  // CIE-10
  diagnosticos: {
    main: [],   // [{ c, d }]
    sec: [],    // [{ c, d }]
    tabla: [],  // filas manuales adicionales
  },

  // Infusiones IV
  infusiones: [],   // [{ id, sol, vol, vel, adit, via, inicio, dur, estado }]

  // Prescripciones médicas — estructura estándar Kárdex
  rxList: [],
  /*
    Objeto rx:
    {
      id, nombre, dosis, via, frecuencia, indicacion, fecha_inicio,
      // extras UI:
      nom, com, conc, frec, pres, dur, urgente, status,
      dosisLog: [{ hora, tipo, nota }],
      cant, farmUnidades, cantAuto,
      calcTxt, upTomaStr,
      obsCustom, solicitudFarmacia,
      discontMotivo, discontObs, discontHora,
      devolucion, devolucionConfirmada,
    }
  */

  // Cola de farmacia
  farmaciaQueue: [],

  // Medicación habitual
  medHabitual: [],

  // Exámenes
  examenes: { solicitados: '', resultados: '' },

  // Firma
  firma: {
    medico: '', codigo: '',
    fecha: new Date().toISOString().slice(0, 16),
    firmado: false,
    hash: '',
    ts: '',
    serie: '',
  },

  // Auditoría interna
  auditoria: {
    estado: 'BORRADOR',
    syncTs: '',
    rxCount: 0,
  },
};

// ── ACTION TYPES ──
export const ACTIONS = {
  // Paciente
  SET_PACIENTE:       'SET_PACIENTE',
  SET_ESTABLECIMIENTO:'SET_ESTABLECIMIENTO',

  // Vitales + IMC
  SET_VITALES:        'SET_VITALES',
  SET_IMC:            'SET_IMC',

  // SOABIE
  SET_SOABIE:         'SET_SOABIE',

  // CIE-10
  ADD_DX_MAIN:        'ADD_DX_MAIN',
  REMOVE_DX_MAIN:     'REMOVE_DX_MAIN',
  ADD_DX_SEC:         'ADD_DX_SEC',
  REMOVE_DX_SEC:      'REMOVE_DX_SEC',

  // Infusiones
  ADD_INF:            'ADD_INF',
  UPDATE_INF:         'UPDATE_INF',
  REMOVE_INF:         'REMOVE_INF',

  // Prescripciones
  ADD_RX:             'ADD_RX',
  UPDATE_RX:          'UPDATE_RX',
  REMOVE_RX:          'REMOVE_RX',
  SET_RX_STATUS:      'SET_RX_STATUS',
  TOGGLE_RX_URGENTE:  'TOGGLE_RX_URGENTE',
  REGISTRAR_DOSIS:    'REGISTRAR_DOSIS',
  ELIMINAR_DOSIS:     'ELIMINAR_DOSIS',
  DESCONTINUAR_RX:    'DESCONTINUAR_RX',

  // Farmacia
  ENVIAR_FARMACIA:    'ENVIAR_FARMACIA',
  DESPACHAR_MED:      'DESPACHAR_MED',

  // Med habitual
  ADD_MED_HAB:        'ADD_MED_HAB',
  REMOVE_MED_HAB:     'REMOVE_MED_HAB',

  // Exámenes
  SET_EXAMENES:       'SET_EXAMENES',

  // Firma
  SET_FIRMA_CAMPOS:   'SET_FIRMA_CAMPOS',
  APLICAR_FIRMA:      'APLICAR_FIRMA',

  // Auditoría
  SET_AUDITORIA:      'SET_AUDITORIA',
};

// ── REDUCER ──
function reducer(state, action) {
  switch (action.type) {

    case ACTIONS.SET_PACIENTE:
      return { ...state, paciente: { ...state.paciente, ...action.payload } };

    case ACTIONS.SET_ESTABLECIMIENTO:
      return { ...state, ...action.payload };

    case ACTIONS.SET_VITALES:
      return { ...state, vitales: { ...state.vitales, ...action.payload } };

    case ACTIONS.SET_IMC:
      return { ...state, imc: { ...state.imc, ...action.payload } };

    case ACTIONS.SET_SOABIE:
      return { ...state, soabie: { ...state.soabie, ...action.payload } };

    // CIE-10
    case ACTIONS.ADD_DX_MAIN: {
      if (state.diagnosticos.main.find(x => x.c === action.payload.c)) return state;
      return { ...state, diagnosticos: { ...state.diagnosticos, main: [...state.diagnosticos.main, action.payload] } };
    }
    case ACTIONS.REMOVE_DX_MAIN:
      return { ...state, diagnosticos: { ...state.diagnosticos, main: state.diagnosticos.main.filter(x => x.c !== action.payload) } };
    case ACTIONS.ADD_DX_SEC: {
      if (state.diagnosticos.sec.find(x => x.c === action.payload.c)) return state;
      return { ...state, diagnosticos: { ...state.diagnosticos, sec: [...state.diagnosticos.sec, action.payload] } };
    }
    case ACTIONS.REMOVE_DX_SEC:
      return { ...state, diagnosticos: { ...state.diagnosticos, sec: state.diagnosticos.sec.filter(x => x.c !== action.payload) } };

    // Infusiones
    case ACTIONS.ADD_INF:
      return { ...state, infusiones: [...state.infusiones, { id: Date.now(), sol: '', vol: '', vel: '', adit: '', via: 'IV periférica', inicio: '', dur: '', estado: 'prog', ...action.payload }] };
    case ACTIONS.UPDATE_INF:
      return { ...state, infusiones: state.infusiones.map(inf => inf.id === action.payload.id ? { ...inf, ...action.payload.data } : inf) };
    case ACTIONS.REMOVE_INF:
      return { ...state, infusiones: state.infusiones.filter(inf => inf.id !== action.payload) };

    // Prescripciones
    case ACTIONS.ADD_RX: {
      const newRx = {
        id: Date.now(),
        nombre: action.payload.n || '',
        dosis: (action.payload.conc || '').split('/')[0].trim(),
        via: action.payload.via || '',
        frecuencia: action.payload.frec || '',
        indicacion: '',
        fecha_inicio: new Date().toISOString().slice(0, 10),
        // extras UI
        nom: action.payload.n || '',
        com: action.payload.com || '',
        conc: action.payload.conc || '',
        frec: action.payload.frec || '',
        pres: action.payload.pres || '',
        dur: action.payload.dur || '',
        urgente: false,
        status: 'pendiente',
        dosisLog: [],
        cant: '',
        farmUnidades: null,
        cantAuto: false,
        calcTxt: '',
        upTomaStr: '',
        obsCustom: '',
        solicitudFarmacia: action.payload.solicitudFarmacia || false,
      };
      return {
        ...state,
        rxList: [...state.rxList, newRx],
        auditoria: { ...state.auditoria, rxCount: state.rxList.length + 1 },
      };
    }
    case ACTIONS.UPDATE_RX:
      return { ...state, rxList: state.rxList.map(rx => rx.id === action.payload.id ? { ...rx, ...action.payload.data } : rx) };
    case ACTIONS.REMOVE_RX:
      return { ...state, rxList: state.rxList.filter(rx => rx.id !== action.payload) };
    case ACTIONS.TOGGLE_RX_URGENTE:
      return { ...state, rxList: state.rxList.map(rx => rx.id === action.payload ? { ...rx, urgente: !rx.urgente } : rx) };

    case ACTIONS.REGISTRAR_DOSIS: {
      const { rxId, hora, tipo } = action.payload;
      return {
        ...state,
        rxList: state.rxList.map(rx => rx.id === rxId
          ? { ...rx, dosisLog: [...(rx.dosisLog || []), { hora, tipo, nota: tipo === 'omitida' ? 'Dosis omitida — registrar motivo' : '' }] }
          : rx
        ),
      };
    }
    case ACTIONS.ELIMINAR_DOSIS: {
      const { rxId, idx } = action.payload;
      return {
        ...state,
        rxList: state.rxList.map(rx => {
          if (rx.id !== rxId) return rx;
          const log = [...(rx.dosisLog || [])];
          log.splice(idx, 1);
          return { ...rx, dosisLog: log };
        }),
      };
    }
    case ACTIONS.DESCONTINUAR_RX: {
      const { id, motivo, obs } = action.payload;
      const hora = new Date().toTimeString().slice(0, 5);
      return {
        ...state,
        rxList: state.rxList.map(rx => rx.id === id
          ? { ...rx, status: 'descontinuada', discontMotivo: motivo, discontObs: obs, discontHora: hora }
          : rx
        ),
        farmaciaQueue: state.farmaciaQueue.map(f => f.id === id ? { ...f, status: 'descontinuada' } : f),
      };
    }

    // Farmacia
    case ACTIONS.ENVIAR_FARMACIA: {
      const rx = state.rxList.find(r => r.id === action.payload.id);
      if (!rx || rx.status !== 'pendiente') return state;
      const entrada = {
        ...rx,
        pac: action.payload.paciente,
        hora: new Date().toTimeString().slice(0, 5),
        cama_id: action.payload.camaId,
        pedido_id: `PED-HCU-${Date.now()}-${rx.id}`,
        origen: 'HCU',
      };
      return {
        ...state,
        rxList: state.rxList.map(r => r.id === rx.id ? { ...r, status: 'enviada' } : r),
        farmaciaQueue: [...state.farmaciaQueue, entrada],
      };
    }
    case ACTIONS.DESPACHAR_MED:
      return {
        ...state,
        rxList: state.rxList.map(rx => rx.id === action.payload ? { ...rx, status: 'despachada' } : rx),
        farmaciaQueue: state.farmaciaQueue.map(f => f.id === action.payload ? { ...f, status: 'despachada' } : f),
      };

    // Med habitual
    case ACTIONS.ADD_MED_HAB:
      return { ...state, medHabitual: [...state.medHabitual, { id: Date.now(), ...action.payload }] };
    case ACTIONS.REMOVE_MED_HAB:
      return { ...state, medHabitual: state.medHabitual.filter(m => m.id !== action.payload) };

    // Exámenes
    case ACTIONS.SET_EXAMENES:
      return { ...state, examenes: { ...state.examenes, ...action.payload } };

    // Firma
    case ACTIONS.SET_FIRMA_CAMPOS:
      return { ...state, firma: { ...state.firma, ...action.payload } };
    case ACTIONS.APLICAR_FIRMA:
      return {
        ...state,
        firma: { ...state.firma, firmado: true, ...action.payload },
        auditoria: { ...state.auditoria, estado: 'FIRMADO DIGITALMENTE', syncTs: new Date().toLocaleString('es-EC') },
      };

    case ACTIONS.SET_AUDITORIA:
      return { ...state, auditoria: { ...state.auditoria, ...action.payload } };

    default:
      return state;
  }
}

// ── CONTEXT + PROVIDER ──
const HCUContext = createContext(null);

export function HCUProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Helpers de dispatch
  const actions = {
    setPaciente:       useCallback(p  => dispatch({ type: ACTIONS.SET_PACIENTE, payload: p }), []),
    setVitales:        useCallback(v  => dispatch({ type: ACTIONS.SET_VITALES, payload: v }), []),
    setIMC:            useCallback(i  => dispatch({ type: ACTIONS.SET_IMC, payload: i }), []),
    setSOABIE:         useCallback(s  => dispatch({ type: ACTIONS.SET_SOABIE, payload: s }), []),
    addDxMain:         useCallback(dx => dispatch({ type: ACTIONS.ADD_DX_MAIN, payload: dx }), []),
    removeDxMain:      useCallback(c  => dispatch({ type: ACTIONS.REMOVE_DX_MAIN, payload: c }), []),
    addDxSec:          useCallback(dx => dispatch({ type: ACTIONS.ADD_DX_SEC, payload: dx }), []),
    removeDxSec:       useCallback(c  => dispatch({ type: ACTIONS.REMOVE_DX_SEC, payload: c }), []),
    addInf:            useCallback(d  => dispatch({ type: ACTIONS.ADD_INF, payload: d }), []),
    updateInf:         useCallback((id, data) => dispatch({ type: ACTIONS.UPDATE_INF, payload: { id, data } }), []),
    removeInf:         useCallback(id => dispatch({ type: ACTIONS.REMOVE_INF, payload: id }), []),
    addRx:             useCallback(med => dispatch({ type: ACTIONS.ADD_RX, payload: med }), []),
    updateRx:          useCallback((id, data) => dispatch({ type: ACTIONS.UPDATE_RX, payload: { id, data } }), []),
    removeRx:          useCallback(id => dispatch({ type: ACTIONS.REMOVE_RX, payload: id }), []),
    toggleUrgente:     useCallback(id => dispatch({ type: ACTIONS.TOGGLE_RX_URGENTE, payload: id }), []),
    registrarDosis:    useCallback((rxId, hora, tipo) => dispatch({ type: ACTIONS.REGISTRAR_DOSIS, payload: { rxId, hora, tipo } }), []),
    eliminarDosis:     useCallback((rxId, idx) => dispatch({ type: ACTIONS.ELIMINAR_DOSIS, payload: { rxId, idx } }), []),
    descontinuarRx:    useCallback((id, motivo, obs) => dispatch({ type: ACTIONS.DESCONTINUAR_RX, payload: { id, motivo, obs } }), []),
    enviarFarmacia:    useCallback((id, paciente, camaId) => dispatch({ type: ACTIONS.ENVIAR_FARMACIA, payload: { id, paciente, camaId } }), []),
    despacharMed:      useCallback(id => dispatch({ type: ACTIONS.DESPACHAR_MED, payload: id }), []),
    addMedHab:         useCallback(m  => dispatch({ type: ACTIONS.ADD_MED_HAB, payload: m }), []),
    removeMedHab:      useCallback(id => dispatch({ type: ACTIONS.REMOVE_MED_HAB, payload: id }), []),
    setExamenes:       useCallback(e  => dispatch({ type: ACTIONS.SET_EXAMENES, payload: e }), []),
    setFirmaCampos:    useCallback(f  => dispatch({ type: ACTIONS.SET_FIRMA_CAMPOS, payload: f }), []),
    aplicarFirma:      useCallback(f  => dispatch({ type: ACTIONS.APLICAR_FIRMA, payload: f }), []),
    setAuditoria:      useCallback(a  => dispatch({ type: ACTIONS.SET_AUDITORIA, payload: a }), []),
  };

  return (
    <HCUContext.Provider value={{ state, actions }}>
      {children}
    </HCUContext.Provider>
  );
}

export function useHCU() {
  const ctx = useContext(HCUContext);
  if (!ctx) throw new Error('useHCU debe usarse dentro de <HCUProvider>');
  return ctx;
}
