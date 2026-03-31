// ══════════════════════════════════════════════════════════════════
// ENTREGABLE 1 — STORE: protocoloOperatorio
// Integrar en src/store/hcuStore.jsx
// Añadir al INITIAL_STATE y al reducer de Atlas HIS
// ══════════════════════════════════════════════════════════════════

// ── 1a. Sub-objeto para agregar al INITIAL_STATE existente ──
export const PROTOCOLO_INITIAL_STATE = {
  protocoloOperatorio: {

    // ── PACIENTE ──
    paciente: {
      nombres:   '',
      id:        '',
      edad:      '',
      servicio:  '',
      seguro:    '',
      hcl:       '',
      fechaNac:  '',
      medico:    '',
      dias:      '',
      alergias:  '',
      fechaCirugia: '',
      numHoja:   '',
    },

    // ── TIPO DE CIRUGÍA Y ANESTESIA ──
    operacion: {
      tipoCirugia: null,     // 'electiva' | 'emergencia' | null
      tipoAnestesia: null,   // 'General' | 'Conductiva' | 'Bloqueo' | 'Sedación' | null
    },

    // ── DIAGNÓSTICOS CIE-10 (múltiples scopes) ──
    diagnosticos: {
      ingreso:        [],   // [{ c: string, d: string }]  — Dx de ingreso
      operacionPropuesta: [], // [{ c: string, d: string }]  — Procedimiento/Operación
      posoperatorio:  [],   // [{ c: string, d: string }]  — Dx posoperatorio
      cie10:          [],   // [{ c: string, d: string, syncedFromIngreso?: boolean }]
    },

    // ── PROCEDIMIENTOS CPT ──
    procedimientosCPT: [], // [{ c: string, d: string }]

    // ── EQUIPO QUIRÚRGICO ──
    equipoQuirurgico: {
      cirujano1:     '',
      cirujano2:     '',
      anestesiologo: '',
      ayudante1:     '',
      ayudante2:     '',
      pediatra:      '',
      sexoRN:        '',
      horaNacRN:     '',
    },

    // ── TIEMPOS QUIRÚRGICOS ──
    tiempos: {
      inicio:    '',   // 'HH:MM'
      fin:       '',   // 'HH:MM'
      duracion:  '',   // calculado: 'Xh Ymin'
      duracionMin: 0,  // en minutos (para uso programático)
    },

    // ── DESCRIPCIÓN QUIRÚRGICA (SOABIE-quirúrgico) ──
    narracion: {
      dieresis:       '',
      exposicion:     '',
      exploracion:    '',   // Hallazgos quirúrgicos
      procedimiento:  '',
      sintesis:       '',
    },

    // ── EQUIPOS E INSUMOS ──
    insumos: {
      rows: [],
      /*
        Estructura de cada row:
        { id: number, cat: string, nombre: string, cantidad: number, obs: string }
        cat: 'instrumental' | 'suturas' | 'drenajes' | 'hemostasia' | 'implantes' | 'generales'
      */
      categoriaFiltro: 'all',
      conteo: {
        gasasInicio:       '',
        gasasFin:          '',
        compresasInicio:   '',
        compresasFin:      '',
        resultado:         null,  // null | 'ok' | 'error'
        mensajeConteo:     '',
      },
    },

    // ── COMPLICACIONES ──
    complicaciones: {
      hubo:        null,   // null | true | false
      descripcion: '',
    },

    // ── MUESTRA PATOLÓGICA ──
    muestra: {
      hubo:          null,   // null | true | false
      tipo:          '',
      piezas:        '',
      diagPresuncion: '',
      urgencia:      'rutina',  // 'rutina' | 'prioritaria' | 'urgente'
      macroscopico:  '',
      patologo:      null,   // objeto { id, nombre, especialidad, email, turno } | null
      notificado:    false,
    },

    // ── FIRMA DEL CIRUJANO ──
    firma: {
      firmaCirujano: '',
      nombreCirujano: '',
    },

    // ── PLANTILLAS (metadatos del sistema de templates) ──
    plantilla: {
      nombre:   '',
      savedAt:  '',
    },
  },
};

// ══════════════════════════════════════════════════════════════════
// ENTREGABLE 2 — ACTIONS del reducer
// Añadir al enum ACTIONS y al reducer existente en hcuStore.jsx
// ══════════════════════════════════════════════════════════════════

// ── 2a. Enumerado ACTIONS — agregar estas claves al ACTIONS existente ──
export const PROTOCOLO_ACTIONS = {
  // Paciente
  SET_PROTO_PACIENTE:          'SET_PROTO_PACIENTE',

  // Operación
  SET_TIPO_CIRUGIA:            'SET_TIPO_CIRUGIA',
  SET_TIPO_ANESTESIA:          'SET_TIPO_ANESTESIA',

  // Diagnósticos CIE-10 (scope independiente por sección)
  ADD_DX_INGRESO:              'ADD_DX_INGRESO',
  REMOVE_DX_INGRESO:           'REMOVE_DX_INGRESO',
  ADD_DX_OP_PROPUESTA:         'ADD_DX_OP_PROPUESTA',
  REMOVE_DX_OP_PROPUESTA:      'REMOVE_DX_OP_PROPUESTA',
  ADD_DX_POSOP:                'ADD_DX_POSOP',
  REMOVE_DX_POSOP:             'REMOVE_DX_POSOP',
  ADD_CIE10:                   'ADD_CIE10',
  REMOVE_CIE10:                'REMOVE_CIE10',
  SYNC_INGRESO_TO_CIE:         'SYNC_INGRESO_TO_CIE',    // Sincroniza Dx ingreso → panel CIE-10
  REMOVE_SYNCED_CIE:           'REMOVE_SYNCED_CIE',

  // CPT
  ADD_CPT:                     'ADD_CPT',
  REMOVE_CPT:                  'REMOVE_CPT',

  // Equipo quirúrgico
  SET_EQUIPO:                  'SET_EQUIPO',

  // Tiempos
  SET_TIEMPO_INICIO:           'SET_TIEMPO_INICIO',
  SET_TIEMPO_FIN:              'SET_TIEMPO_FIN',

  // Narración quirúrgica
  SET_NARRACION:               'SET_NARRACION',

  // Insumos
  ADD_INSUMO:                  'ADD_INSUMO',
  UPDATE_INSUMO:               'UPDATE_INSUMO',
  REMOVE_INSUMO:               'REMOVE_INSUMO',
  SET_INSUMO_FILTRO:           'SET_INSUMO_FILTRO',
  UPDATE_CONTEO:               'UPDATE_CONTEO',

  // Complicaciones
  SET_COMPLICACIONES:          'SET_COMPLICACIONES',

  // Muestra patológica
  SET_MUESTRA:                 'SET_MUESTRA',
  SET_PATOLOGO:                'SET_PATOLOGO',
  CLEAR_PATOLOGO:              'CLEAR_PATOLOGO',
  SET_MUESTRA_NOTIFICADA:      'SET_MUESTRA_NOTIFICADA',

  // Firma
  SET_FIRMA_CIRUJANO:          'SET_FIRMA_CIRUJANO',

  // Plantilla
  CARGAR_PLANTILLA:            'CARGAR_PLANTILLA',
  RESET_PROTOCOLO:             'RESET_PROTOCOLO',
};

// ── 2b. Casos del reducer — agregar dentro del switch en hcuStore.jsx ──
//
// IMPORTANTE: El `state` aquí se refiere al state completo de Atlas HIS.
// Todos los casos operan sobre state.protocoloOperatorio de forma inmutable.
//
// Helper interno (no exportar):
//   const P = state.protocoloOperatorio;
//   return { ...state, protocoloOperatorio: { ...P, ... } };

export function protocoloReducerCases(state, action) {
  const P = state.protocoloOperatorio;

  switch (action.type) {

    // ── PACIENTE ──
    case PROTOCOLO_ACTIONS.SET_PROTO_PACIENTE:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          paciente: { ...P.paciente, ...action.payload },
        },
      };

    // ── TIPO CIRUGÍA ──
    case PROTOCOLO_ACTIONS.SET_TIPO_CIRUGIA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          operacion: {
            ...P.operacion,
            // Toggle: si se selecciona el mismo, deseleccionar
            tipoCirugia: P.operacion.tipoCirugia === action.payload ? null : action.payload,
          },
        },
      };

    // ── TIPO ANESTESIA ──
    case PROTOCOLO_ACTIONS.SET_TIPO_ANESTESIA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          operacion: {
            ...P.operacion,
            tipoAnestesia: P.operacion.tipoAnestesia === action.payload ? null : action.payload,
          },
        },
      };

    // ── DIAGNÓSTICOS CIE-10 — INGRESO ──
    case PROTOCOLO_ACTIONS.ADD_DX_INGRESO: {
      if (P.diagnosticos.ingreso.find(x => x.c === action.payload.c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            ingreso: [...P.diagnosticos.ingreso, action.payload],
          },
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_DX_INGRESO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            ingreso: P.diagnosticos.ingreso.filter(x => x.c !== action.payload),
          },
        },
      };

    // ── OPERACIÓN PROPUESTA ──
    case PROTOCOLO_ACTIONS.ADD_DX_OP_PROPUESTA: {
      if (P.diagnosticos.operacionPropuesta.find(x => x.c === action.payload.c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            operacionPropuesta: [...P.diagnosticos.operacionPropuesta, action.payload],
          },
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_DX_OP_PROPUESTA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            operacionPropuesta: P.diagnosticos.operacionPropuesta.filter(x => x.c !== action.payload),
          },
        },
      };

    // ── DIAGNÓSTICO POSOPERATORIO ──
    case PROTOCOLO_ACTIONS.ADD_DX_POSOP: {
      if (P.diagnosticos.posoperatorio.find(x => x.c === action.payload.c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            posoperatorio: [...P.diagnosticos.posoperatorio, action.payload],
          },
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_DX_POSOP:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            posoperatorio: P.diagnosticos.posoperatorio.filter(x => x.c !== action.payload),
          },
        },
      };

    // ── CIE-10 (panel de codificación) ──
    case PROTOCOLO_ACTIONS.ADD_CIE10: {
      if (P.diagnosticos.cie10.find(x => x.c === action.payload.c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            cie10: [...P.diagnosticos.cie10, { ...action.payload, syncedFromIngreso: false }],
          },
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_CIE10:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            cie10: P.diagnosticos.cie10.filter(x => x.c !== action.payload),
          },
        },
      };

    // Sincronizar Dx Ingreso → panel CIE-10
    case PROTOCOLO_ACTIONS.SYNC_INGRESO_TO_CIE: {
      const { c, d } = action.payload;
      if (P.diagnosticos.cie10.find(x => x.c === c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            cie10: [...P.diagnosticos.cie10, { c, d, syncedFromIngreso: true }],
          },
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_SYNCED_CIE:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          diagnosticos: {
            ...P.diagnosticos,
            cie10: P.diagnosticos.cie10.filter(x => !(x.c === action.payload && x.syncedFromIngreso)),
          },
        },
      };

    // ── CPT ──
    case PROTOCOLO_ACTIONS.ADD_CPT: {
      if (P.procedimientosCPT.find(x => x.c === action.payload.c)) return state;
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          procedimientosCPT: [...P.procedimientosCPT, action.payload],
        },
      };
    }
    case PROTOCOLO_ACTIONS.REMOVE_CPT:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          procedimientosCPT: P.procedimientosCPT.filter(x => x.c !== action.payload),
        },
      };

    // ── EQUIPO QUIRÚRGICO ──
    case PROTOCOLO_ACTIONS.SET_EQUIPO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          equipoQuirurgico: { ...P.equipoQuirurgico, ...action.payload },
        },
      };

    // ── TIEMPOS — calcular duración de forma inmutable ──
    case PROTOCOLO_ACTIONS.SET_TIEMPO_INICIO:
    case PROTOCOLO_ACTIONS.SET_TIEMPO_FIN: {
      const field  = action.type === PROTOCOLO_ACTIONS.SET_TIEMPO_INICIO ? 'inicio' : 'fin';
      const newTiempos = { ...P.tiempos, [field]: action.payload };
      const { inicio, fin } = newTiempos;

      let duracion = '';
      let duracionMin = 0;
      if (inicio && fin) {
        const [ih, im] = inicio.split(':').map(Number);
        const [fh, fm] = fin.split(':').map(Number);
        let mins = (fh * 60 + fm) - (ih * 60 + im);
        if (mins < 0) mins += 1440; // cruce de medianoche
        duracionMin = mins;
        const h = Math.floor(mins / 60), m = mins % 60;
        duracion = h > 0 ? `${h}h ${m}min` : `${m} min`;
      }

      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          tiempos: { ...newTiempos, duracion, duracionMin },
        },
      };
    }

    // ── NARRACIÓN QUIRÚRGICA ──
    case PROTOCOLO_ACTIONS.SET_NARRACION:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          narracion: { ...P.narracion, ...action.payload },
        },
      };

    // ── INSUMOS ──
    case PROTOCOLO_ACTIONS.ADD_INSUMO: {
      const newRow = {
        id: Date.now(),
        cat: action.payload.cat,
        nombre: action.payload.nombre,
        cantidad: 1,
        obs: '',
      };
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          insumos: { ...P.insumos, rows: [...P.insumos.rows, newRow] },
        },
      };
    }
    case PROTOCOLO_ACTIONS.UPDATE_INSUMO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          insumos: {
            ...P.insumos,
            rows: P.insumos.rows.map(r =>
              r.id === action.payload.id
                ? { ...r, [action.payload.field]: action.payload.value }
                : r
            ),
          },
        },
      };
    case PROTOCOLO_ACTIONS.REMOVE_INSUMO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          insumos: {
            ...P.insumos,
            rows: P.insumos.rows.filter(r => r.id !== action.payload),
          },
        },
      };
    case PROTOCOLO_ACTIONS.SET_INSUMO_FILTRO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          insumos: { ...P.insumos, categoriaFiltro: action.payload },
        },
      };

    // Conteo de gasas/compresas — calcula resultado inmutablemente
    case PROTOCOLO_ACTIONS.UPDATE_CONTEO: {
      const conteo = { ...P.insumos.conteo, ...action.payload };
      const { gasasInicio, gasasFin, compresasInicio, compresasFin } = conteo;
      const gi = parseInt(gasasInicio)  || 0;
      const gf = parseInt(gasasFin)     || 0;
      const ci = parseInt(compresasInicio) || 0;
      const cf = parseInt(compresasFin)    || 0;
      const tieneData = gi || gf || ci || cf;
      let resultado = null, mensajeConteo = '';
      if (tieneData) {
        const ok = gi === gf && ci === cf;
        resultado = ok ? 'ok' : 'error';
        mensajeConteo = ok
          ? `✅ Conteo correcto — Gasas: ${gi}/${gf} · Compresas: ${ci}/${cf}`
          : `⚠️ CONTEO INCORRECTO — Gasas: inicio ${gi} / fin ${gf} · Compresas: inicio ${ci} / fin ${cf}`;
      }
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          insumos: { ...P.insumos, conteo: { ...conteo, resultado, mensajeConteo } },
        },
      };
    }

    // ── COMPLICACIONES ──
    case PROTOCOLO_ACTIONS.SET_COMPLICACIONES:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          complicaciones: { ...P.complicaciones, ...action.payload },
        },
      };

    // ── MUESTRA PATOLÓGICA ──
    case PROTOCOLO_ACTIONS.SET_MUESTRA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          muestra: { ...P.muestra, ...action.payload },
        },
      };
    case PROTOCOLO_ACTIONS.SET_PATOLOGO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          muestra: { ...P.muestra, patologo: action.payload, notificado: false },
        },
      };
    case PROTOCOLO_ACTIONS.CLEAR_PATOLOGO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          muestra: { ...P.muestra, patologo: null, notificado: false },
        },
      };
    case PROTOCOLO_ACTIONS.SET_MUESTRA_NOTIFICADA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          muestra: { ...P.muestra, notificado: true },
        },
      };

    // ── FIRMA ──
    case PROTOCOLO_ACTIONS.SET_FIRMA_CIRUJANO:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          firma: { ...P.firma, ...action.payload },
        },
      };

    // ── PLANTILLA — cargar estado completo ──
    case PROTOCOLO_ACTIONS.CARGAR_PLANTILLA:
      return {
        ...state,
        protocoloOperatorio: {
          ...P,
          ...action.payload,
          plantilla: { nombre: action.payload.nombre || '', savedAt: action.payload.savedAt || '' },
        },
      };

    // ── RESET ──
    case PROTOCOLO_ACTIONS.RESET_PROTOCOLO:
      return {
        ...state,
        protocoloOperatorio: PROTOCOLO_INITIAL_STATE.protocoloOperatorio,
      };

    default:
      return state;
  }
}
