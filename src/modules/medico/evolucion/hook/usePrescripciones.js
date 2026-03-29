import { useEffect, useMemo, useReducer, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient.js";

const MEDICAMENTOS_CATALOGO_TABLE =
  import.meta.env.VITE_SUPABASE_MEDICAMENTOS_CATALOGO_TABLE ||
  "medicamentos_catalogo";

const STORAGE_KEY = "atlas_evolucion_prescripciones_v2";

const INITIAL_STATE = {
  rxList: [],
  farmaciaQueue: [],
  rxCounter: 0,
};

const FREC_DOSIS_DIA = {
  "c/1h": 24,
  "c/2h": 12,
  "c/4h": 6,
  "c/6h": 4,
  "c/8h": 3,
  "c/12h": 2,
  "c/24h": 1,
  "c/48h": 0.5,
  "c/72h": 1 / 3,
  nocturno: 1,
  "lunes, miercoles, viernes": 3 / 7,
  "lunes a viernes": 5 / 7,
};

const VIA_OPTIONS = [
  "",
  "VO",
  "SL",
  "IV directa",
  "IV continua",
  "IV intermitente",
  "IM",
  "SC",
  "ID",
  "IO",
  "IT",
  "Topico",
  "Nebulizacion",
  "Rectal",
  "Otica",
  "Oftalmica",
  "Nasal",
  "SNG",
  "Epidural",
];

const FRECUENCIA_OPTIONS = [
  "",
  "c/1h",
  "c/2h",
  "c/4h",
  "c/6h",
  "c/8h",
  "c/12h",
  "c/24h",
  "c/48h",
  "c/72h",
  "Una sola dosis (dosis unica)",
  "PRN",
  "PRN c/4h",
  "PRN c/6h",
  "PRN c/8h",
  "Infusion continua 24h",
  "Lunes, Miercoles, Viernes",
  "Lunes a Viernes",
  "Nocturno",
];

const STATUS_ORDER = {
  pendiente: 0,
  enviada: 1,
  despachada: 2,
  descontinuada: 3,
};

const MASS_CONVERSION = {
  g: 1000,
  gr: 1000,
  mg: 1,
  mcg: 0.001,
  ug: 0.001,
  ui: 1,
  u: 1,
  meq: 1,
  mmol: 1,
};

function normalizeText(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseValueWithUnit(input) {
  if (!input) return null;
  const cleaned = String(input).trim().toLowerCase().replace(",", ".");
  const match = cleaned.match(/^([\d]+(?:\.\d+)?)\s*([a-zA-Z\u00b5\u03bc]+)?/);
  if (!match) return null;

  let unit = (match[2] || "mg")
    .replace("µ", "u")
    .replace("μ", "u")
    .replace(/\.$/, "")
    .trim();

  if (unit === "caps") unit = "cap";
  if (unit === "mgs") unit = "mg";

  return {
    value: Number.parseFloat(match[1]),
    unit,
  };
}

function toMassEquivalent(parsed) {
  if (!parsed || !Number.isFinite(parsed.value)) return null;
  const factor = MASS_CONVERSION[parsed.unit] || null;
  if (factor === null) return null;
  return parsed.value * factor;
}

function getPresentacionLabel(concentracion) {
  const text = normalizeText(concentracion);
  if (!text) return "unid";
  if (text.includes("amp") || text.includes("vial")) return "amp";
  if (text.includes("tab") || text.includes("comp")) return "tab";
  if (text.includes("cap")) return "cap";
  if (text.includes("frasco")) return "frasco";
  if (text.includes("sobre")) return "sobre";
  if (text.includes("gota")) return "gota";
  return "unid";
}

function isPrnFrequency(frecuencia) {
  return normalizeText(frecuencia).includes("prn");
}

function isSingleDoseFrequency(frecuencia) {
  const text = normalizeText(frecuencia);
  return text.includes("dosis unica") || text.includes("una sola dosis");
}

function isContinuousInfusionFrequency(frecuencia) {
  const text = normalizeText(frecuencia);
  return text.includes("infusion continua");
}

function resolveDosisDia(frecuencia) {
  const text = normalizeText(frecuencia);
  if (!text) return null;

  const intervalMatch = text.match(/^c\/(\d+)h/);
  if (intervalMatch) {
    const hours = Number.parseInt(intervalMatch[1], 10);
    if (hours > 0) return 24 / hours;
  }

  if (Object.prototype.hasOwnProperty.call(FREC_DOSIS_DIA, text)) {
    return FREC_DOSIS_DIA[text];
  }

  return null;
}

function calcDosis(rx) {
  const dosisRaw = (rx.dosis || "").trim();
  const concRaw = (rx.conc || "").trim();
  const frecuenciaRaw = rx.frec || "";

  const presentationUnitDose = dosisRaw.match(
    /^([\d]+(?:[.,]\d+)?)\s*(tab|comp|comprimido[s]?|caps?|capsula[s]?|amp|ampolla[s]?|frasco[s]?|sobre[s]?|gota[s]?|puff[s]?|vial(?:es)?)/i
  );

  let unidadesPorToma = null;
  let upTomaStr = "";
  const presentacion = getPresentacionLabel(concRaw);

  if (dosisRaw && concRaw) {
    if (presentationUnitDose) {
      const raw = Number.parseFloat(presentationUnitDose[1].replace(",", "."));
      unidadesPorToma = Math.ceil(raw);
      upTomaStr = `${unidadesPorToma} ${presentationUnitDose[2]}`;
    } else {
      const doseParsed = parseValueWithUnit(dosisRaw);
      const concentrationNum = concRaw.split("/")[0]?.trim() || concRaw;
      const concentrationParsed = parseValueWithUnit(concentrationNum);

      const doseMass = toMassEquivalent(doseParsed);
      const concentrationMass = toMassEquivalent(concentrationParsed);

      if (doseMass && concentrationMass) {
        unidadesPorToma = Math.ceil(doseMass / concentrationMass);
        const denominator = concRaw.split("/")[1]?.trim();
        const unitLabel = denominator || presentacion;
        upTomaStr = `${unidadesPorToma} ${unitLabel}`;
      }
    }
  }

  const isPrn = isPrnFrequency(frecuenciaRaw);
  const isSingleDose = isSingleDoseFrequency(frecuenciaRaw);
  const isContinuous = isContinuousInfusionFrequency(frecuenciaRaw);
  const dosisDia = resolveDosisDia(frecuenciaRaw);

  let cantAuto = false;
  let cant = null;
  let calcTxt = "";

  if (isSingleDose) {
    cantAuto = true;
    cant = Math.max(1, unidadesPorToma || 1);
    calcTxt = unidadesPorToma
      ? `${upTomaStr} - dosis unica`
      : "Dosis unica - 1 unidad";
  } else if (isPrn || isContinuous) {
    cantAuto = false;
    calcTxt = isPrn
      ? "PRN: total no calculable automaticamente"
      : "Infusion continua: total no calculable automaticamente";
  } else if (unidadesPorToma && dosisDia) {
    cantAuto = true;
    cant = Math.ceil(unidadesPorToma * dosisDia);
    calcTxt = `${upTomaStr}/toma x ${Number(dosisDia.toFixed(2))}/dia = ${cant} unid/dia`;
  } else if (unidadesPorToma && !dosisDia) {
    cantAuto = true;
    cant = unidadesPorToma;
    calcTxt = `${upTomaStr}/toma - seleccione frecuencia`;
  } else if (dosisRaw && concRaw) {
    calcTxt = "No se pudo calcular. Verifique dosis y concentracion.";
  } else if (dosisRaw && !concRaw) {
    calcTxt = "Ingrese concentracion (ej: 500mg/tab).";
  }

  return {
    cant,
    cantAuto,
    farmUnidades: cant,
    calcTxt,
    upTomaStr: upTomaStr || "-",
    unidadesPorToma,
  };
}

function getDoseAdminCount(rx) {
  return (rx.dosisLog || []).filter((item) => item.tipo === "admin").length;
}

function calculateDevolucion(rx) {
  const totalDespachado = toPositiveInt(rx.totalDespachado);
  if (!totalDespachado) return 0;
  const admin = getDoseAdminCount(rx);
  return Math.max(0, totalDespachado - admin);
}

function buildBaseRx(partial = {}) {
  return {
    id: partial.id,
    nom: partial.nom || partial.nombre || "",
    com: partial.com || partial.comercial || "",
    conc: partial.conc || partial.concentracion || "",
    dosis: partial.dosis || "",
    via: partial.via || "",
    frec: partial.frec || partial.frecuencia || "",
    dur: partial.dur || partial.duracion || "",
    status: partial.status || "pendiente",
    urgente: Boolean(partial.urgente),
    farmUnidades: toPositiveInt(partial.farmUnidades) || null,
    cant: toPositiveInt(partial.cant) || "",
    cantAuto: Boolean(partial.cantAuto),
    dosisLog: Array.isArray(partial.dosisLog) ? partial.dosisLog : [],
    solicitudFarmacia: Boolean(partial.solicitudFarmacia),
    calcTxt: partial.calcTxt || "",
    upTomaStr: partial.upTomaStr || "-",
    obsCustom: partial.obsCustom || partial.indicaciones || "",
    discontMotivo: partial.discontMotivo || "",
    discontObs: partial.discontObs || "",
    discontHora: partial.discontHora || "",
    totalDespachado: toPositiveInt(partial.totalDespachado) || 0,
    devolucion: toPositiveInt(partial.devolucion) || 0,
    devolucionConfirmadaAt: partial.devolucionConfirmadaAt || null,
  };
}

function applyDoseCalc(rx, options = {}) {
  const { forceAuto = false } = options;
  const calc = calcDosis(rx);
  const next = {
    ...rx,
    calcTxt: calc.calcTxt,
    upTomaStr: calc.upTomaStr,
    cantAuto: calc.cantAuto,
  };

  if (calc.cantAuto && calc.cant) {
    next.cant = calc.cant;
    next.farmUnidades = calc.farmUnidades;
  } else if (!calc.cantAuto) {
    if (forceAuto) {
      next.cant = "";
      next.farmUnidades = null;
    } else {
      const manualCant = toPositiveInt(rx.cant);
      next.cant = manualCant || rx.cant || "";
      next.farmUnidades = manualCant || toPositiveInt(rx.farmUnidades) || null;
      next.cantAuto = false;
    }
  }

  return next;
}

function buildQueueItem(rx, pacienteNombre, pacienteMeta = {}) {
  return {
    id: rx.id,
    nom: rx.nom,
    com: rx.com,
    conc: rx.conc,
    dosis: rx.dosis,
    via: rx.via,
    frec: rx.frec,
    dur: rx.dur,
    urgente: Boolean(rx.urgente),
    status: rx.status,
    farmUnidades: toPositiveInt(rx.farmUnidades) || toPositiveInt(rx.cant) || 1,
    cant: toPositiveInt(rx.cant) || 0,
    solicitudFarmacia: Boolean(rx.solicitudFarmacia),
    paciente: pacienteNombre || "Paciente",
    admisionId: pacienteMeta.admisionId || rx.admisionId || null,
    cama: pacienteMeta.cama || rx.cama || "",
    medico: pacienteMeta.medico || rx.medico || "",
    bodega: pacienteMeta.bodega || rx.bodega || "Farmacia Central",
    area: pacienteMeta.area || rx.area || "",
    hora: new Date().toTimeString().slice(0, 5),
    devolucionPendiente: toPositiveInt(rx.devolucion),
    devolucionConfirmadaAt: rx.devolucionConfirmadaAt || null,
  };
}

function replaceQueueItem(queue, rx, pacienteNombre, pacienteMeta = {}) {
  return queue.map((item) => {
    if (item.id !== rx.id) return item;
    return {
      ...item,
      ...buildQueueItem(rx, item.paciente || pacienteNombre, {
        admisionId: item.admisionId,
        cama: item.cama,
        medico: item.medico,
        bodega: item.bodega,
        area: item.area,
        ...pacienteMeta,
      }),
      hora: item.hora,
      paciente: item.paciente || pacienteNombre,
      status:
        STATUS_ORDER[item.status] > STATUS_ORDER[rx.status]
          ? item.status
          : rx.status,
      devolucionPendiente: toPositiveInt(rx.devolucion),
      devolucionConfirmadaAt: rx.devolucionConfirmadaAt || null,
    };
  });
}

function sortQueue(queue) {
  return [...queue].sort((a, b) => {
    if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
    return (a.hora || "").localeCompare(b.hora || "");
  });
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      const payload = action.payload || INITIAL_STATE;
      const rxList = Array.isArray(payload.rxList)
        ? payload.rxList.map((rx, index) => {
            const base = buildBaseRx({ ...rx, id: rx.id ?? index + 1 });
            const hydrated = applyDoseCalc(base);
            const devolucion = calculateDevolucion(hydrated);
            return { ...hydrated, devolucion };
          })
        : [];

      const queue = Array.isArray(payload.farmaciaQueue)
        ? payload.farmaciaQueue
            .map((item) => ({
              ...item,
              status: item.status || "enviada",
              farmUnidades: toPositiveInt(item.farmUnidades) || 1,
              devolucionPendiente: toPositiveInt(item.devolucionPendiente),
            }))
        : [];

      return {
        rxList,
        farmaciaQueue: sortQueue(queue),
        rxCounter: Math.max(
          toPositiveInt(payload.rxCounter),
          ...rxList.map((rx) => toPositiveInt(rx.id))
        ),
      };
    }

    case "ADD_RX": {
      const nextId = state.rxCounter + 1;
      const base = buildBaseRx({ ...action.payload, id: nextId });
      const withCalc = applyDoseCalc(base);
      return {
        ...state,
        rxCounter: nextId,
        rxList: [...state.rxList, withCalc],
      };
    }

    case "ADD_SOLICITUD_FARMACIA": {
      const { solicitud, pacienteNombre, pacienteMeta } = action.payload;
      const nextId = state.rxCounter + 1;
      const base = buildBaseRx({
        id: nextId,
        nom: solicitud.nombre,
        com: "- Solicitud a Farmacia -",
        conc: solicitud.conc,
        dosis: solicitud.dosis,
        via: solicitud.via,
        frec: solicitud.frecuencia,
        dur: solicitud.duracion,
        obsCustom: solicitud.indicaciones,
        solicitudFarmacia: true,
        status: "enviada",
      });
      const withCalc = applyDoseCalc(base);
      const nextRx = {
        ...withCalc,
        farmUnidades:
          toPositiveInt(withCalc.farmUnidades) || toPositiveInt(withCalc.cant) || 1,
      };

      return {
        ...state,
        rxCounter: nextId,
        rxList: [...state.rxList, nextRx],
        farmaciaQueue: sortQueue([
          ...state.farmaciaQueue,
          buildQueueItem(nextRx, pacienteNombre, pacienteMeta),
        ]),
      };
    }

    case "UPDATE_RX_FIELD": {
      const { id, field, value } = action.payload;
      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id) return rx;

        const updated = {
          ...rx,
          [field]: value,
        };

        if (field === "cant") {
          const numeric = toPositiveInt(value);
          updated.cantAuto = false;
          updated.cant = numeric || value;
          updated.farmUnidades = numeric || null;
          return {
            ...updated,
            devolucion: calculateDevolucion(updated),
          };
        }

        if (["conc", "dosis", "frec", "dur"].includes(field)) {
          const recalculated = applyDoseCalc(updated);
          return {
            ...recalculated,
            devolucion: calculateDevolucion(recalculated),
          };
        }

        return {
          ...updated,
          devolucion: calculateDevolucion(updated),
        };
      });

      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = changedRx
        ? replaceQueueItem(state.farmaciaQueue, changedRx, changedRx.paciente)
        : state.farmaciaQueue;

      return {
        ...state,
        rxList,
        farmaciaQueue: sortQueue(farmaciaQueue),
      };
    }

    case "REMOVE_RX": {
      const id = action.payload.id;
      return {
        ...state,
        rxList: state.rxList.filter((rx) => rx.id !== id),
        farmaciaQueue: state.farmaciaQueue.filter((item) => item.id !== id),
      };
    }

    case "TOGGLE_URGENTE": {
      const id = action.payload.id;
      const rxList = state.rxList.map((rx) =>
        rx.id === id ? { ...rx, urgente: !rx.urgente } : rx
      );
      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = changedRx
        ? replaceQueueItem(state.farmaciaQueue, changedRx, changedRx.paciente)
        : state.farmaciaQueue;

      return {
        ...state,
        rxList,
        farmaciaQueue: sortQueue(farmaciaQueue),
      };
    }

    case "SEND_RX": {
      const { id, pacienteNombre, pacienteMeta } = action.payload;
      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id || rx.status !== "pendiente") return rx;
        const recalculated = applyDoseCalc(rx);
        return {
          ...recalculated,
          status: "enviada",
          farmUnidades:
            toPositiveInt(recalculated.farmUnidades) ||
            toPositiveInt(recalculated.cant) ||
            1,
        };
      });

      const target = rxList.find((rx) => rx.id === id);
      if (!target || target.status !== "enviada") return state;

      const alreadyInQueue = state.farmaciaQueue.some((item) => item.id === id);
      const farmaciaQueue = alreadyInQueue
        ? replaceQueueItem(state.farmaciaQueue, target, pacienteNombre, pacienteMeta)
        : [...state.farmaciaQueue, buildQueueItem(target, pacienteNombre, pacienteMeta)];

      return {
        ...state,
        rxList,
        farmaciaQueue: sortQueue(farmaciaQueue),
      };
    }

    case "SEND_ALL": {
      const { pacienteNombre, pacienteMeta } = action.payload;
      const rxList = state.rxList.map((rx) => {
        if (rx.status !== "pendiente") return rx;
        const recalculated = applyDoseCalc(rx);
        return {
          ...recalculated,
          status: "enviada",
          farmUnidades:
            toPositiveInt(recalculated.farmUnidades) ||
            toPositiveInt(recalculated.cant) ||
            1,
        };
      });

      const updates = rxList.filter((rx) => rx.status === "enviada");
      if (!updates.length) return state;

      let farmaciaQueue = [...state.farmaciaQueue];
      updates.forEach((rx) => {
        const exists = farmaciaQueue.some((item) => item.id === rx.id);
        farmaciaQueue = exists
          ? replaceQueueItem(farmaciaQueue, rx, pacienteNombre, pacienteMeta)
          : [...farmaciaQueue, buildQueueItem(rx, pacienteNombre, pacienteMeta)];
      });

      return {
        ...state,
        rxList,
        farmaciaQueue: sortQueue(farmaciaQueue),
      };
    }

    case "DESPACHAR_RX": {
      const { id } = action.payload;
      const current = state.rxList.find((rx) => rx.id === id);
      if (!current || current.status === "descontinuada") {
        return state;
      }

      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id) return rx;
        const totalDespachado =
          toPositiveInt(rx.farmUnidades) || toPositiveInt(rx.cant) || 1;
        const next = {
          ...rx,
          status: "despachada",
          totalDespachado,
        };
        return {
          ...next,
          devolucion: calculateDevolucion(next),
        };
      });

      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = sortQueue(
        state.farmaciaQueue.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status: "despachada",
            devolucionPendiente: toPositiveInt(changedRx?.devolucion),
          };
        })
      );

      return {
        ...state,
        rxList,
        farmaciaQueue,
      };
    }

    case "REGISTRAR_DOSIS": {
      const { id, tipo, hora } = action.payload;
      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id) return rx;
        const nextLog = [
          ...(rx.dosisLog || []),
          {
            hora: hora || new Date().toTimeString().slice(0, 5),
            tipo,
          },
        ];
        const nextRx = {
          ...rx,
          dosisLog: nextLog,
        };
        return {
          ...nextRx,
          devolucion: calculateDevolucion(nextRx),
        };
      });

      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = changedRx
        ? sortQueue(replaceQueueItem(state.farmaciaQueue, changedRx, changedRx.paciente))
        : state.farmaciaQueue;

      return {
        ...state,
        rxList,
        farmaciaQueue,
      };
    }

    case "ELIMINAR_DOSIS": {
      const { id, index } = action.payload;
      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id) return rx;
        const nextLog = (rx.dosisLog || []).filter((_, i) => i !== index);
        const nextRx = {
          ...rx,
          dosisLog: nextLog,
        };
        return {
          ...nextRx,
          devolucion: calculateDevolucion(nextRx),
        };
      });

      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = changedRx
        ? sortQueue(replaceQueueItem(state.farmaciaQueue, changedRx, changedRx.paciente))
        : state.farmaciaQueue;

      return {
        ...state,
        rxList,
        farmaciaQueue,
      };
    }

    case "DESCONTINUAR_RX": {
      const { id, motivo, observacion } = action.payload;
      const hora = new Date().toTimeString().slice(0, 5);

      const rxList = state.rxList.map((rx) => {
        if (rx.id !== id) return rx;
        const nextRx = {
          ...rx,
          status: "descontinuada",
          discontMotivo: motivo,
          discontObs: observacion || "",
          discontHora: hora,
        };
        return {
          ...nextRx,
          devolucion: calculateDevolucion(nextRx),
        };
      });

      const changedRx = rxList.find((rx) => rx.id === id);
      const farmaciaQueue = changedRx
        ? sortQueue(replaceQueueItem(state.farmaciaQueue, changedRx, changedRx.paciente))
        : state.farmaciaQueue;

      return {
        ...state,
        rxList,
        farmaciaQueue,
      };
    }

    case "CONFIRMAR_DEVOLUCION": {
      const { id } = action.payload;
      const now = new Date().toISOString();

      const rxList = state.rxList.map((rx) =>
        rx.id === id ? { ...rx, devolucionConfirmadaAt: now } : rx
      );

      const farmaciaQueue = state.farmaciaQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              devolucionConfirmadaAt: now,
            }
          : item
      );

      return {
        ...state,
        rxList,
        farmaciaQueue: sortQueue(farmaciaQueue),
      };
    }

    case "SYNC_PACIENTE_NOMBRE": {
      const paciente = (action.payload?.pacienteNombre || "").trim();
      if (!paciente || state.farmaciaQueue.length === 0) return state;

      return {
        ...state,
        farmaciaQueue: state.farmaciaQueue.map((item) => ({
          ...item,
          paciente,
        })),
      };
    }

    case "RESET": {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}

export default function usePrescripciones(options = {}) {
  const { pacienteNombre = "Paciente", pacienteMeta = {}, storageKey = STORAGE_KEY } = options;
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(false);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: parsed });
      } else {
        dispatch({ type: "RESET" });
      }
    } catch (error) {
      console.error("No se pudo hidratar prescripciones:", error);
      dispatch({ type: "RESET" });
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [isHydrated, state, storageKey]);

  useEffect(() => {
    if (!isHydrated || !pacienteNombre?.trim()) return;
    dispatch({
      type: "SYNC_PACIENTE_NOMBRE",
      payload: { pacienteNombre },
    });
  }, [isHydrated, pacienteNombre]);

  const stats = useMemo(() => {
    const pendientesFarmacia = state.farmaciaQueue.filter(
      (item) => item.status !== "despachada"
    ).length;

    const devolucionesPendientes = state.rxList.filter(
      (rx) => toPositiveInt(rx.devolucion) > 0 && !rx.devolucionConfirmadaAt
    ).length;

    return {
      totalRx: state.rxList.length,
      pendientesFarmacia,
      devolucionesPendientes,
      despachadas: state.rxList.filter((rx) => rx.status === "despachada").length,
    };
  }, [state]);

  const searchMedicamentos = async (query) => {
    const q = (query || "").trim();
    if (q.length < 2) return [];

    const escaped = q.replace(/,/g, "\\,").replace(/\*/g, "");
    const pattern = `%${escaped}%`;

    const { data, error } = await supabase
      .from(MEDICAMENTOS_CATALOGO_TABLE)
      .select(
        "id, nombre, comercial, concentracion, dosis, via, frecuencia, duracion, categoria"
      )
      .or(
        `nombre.ilike.${pattern},comercial.ilike.${pattern},categoria.ilike.${pattern}`
      )
      .limit(20);

    if (error) {
      console.error("Error consultando catalogo de medicamentos:", error);
      return [];
    }

    return (data || []).map((row, index) => ({
      id: row.id || `catalog-${Date.now()}-${index}`,
      nombre: row.nombre || "",
      comercial: row.comercial || "",
      concentracion: row.concentracion || "",
      dosis: row.dosis || "",
      via: row.via || "",
      frecuencia: row.frecuencia || "",
      duracion: row.duracion || "",
      categoria: row.categoria || "",
    }));
  };

  return {
    state,
    rxList: state.rxList,
    farmaciaQueue: state.farmaciaQueue,
    rxCounter: state.rxCounter,
    stats,
    viaOptions: VIA_OPTIONS,
    frecuenciaOptions: FRECUENCIA_OPTIONS,
    searchMedicamentos,

    addRxFromCatalog: (med) => dispatch({ type: "ADD_RX", payload: med }),

    addSolicitudFarmacia: (solicitud, paciente = pacienteNombre, meta = pacienteMeta) =>
      dispatch({
        type: "ADD_SOLICITUD_FARMACIA",
        payload: {
          solicitud,
          pacienteNombre: paciente,
          pacienteMeta: meta,
        },
      }),

    updateRxField: (id, field, value) =>
      dispatch({ type: "UPDATE_RX_FIELD", payload: { id, field, value } }),

    removeRx: (id) => dispatch({ type: "REMOVE_RX", payload: { id } }),

    toggleUrgente: (id) => dispatch({ type: "TOGGLE_URGENTE", payload: { id } }),

    sendRxToFarmacia: (id, paciente = pacienteNombre, meta = pacienteMeta) =>
      dispatch({
        type: "SEND_RX",
        payload: { id, pacienteNombre: paciente, pacienteMeta: meta },
      }),

    sendAllToFarmacia: (paciente = pacienteNombre, meta = pacienteMeta) =>
      dispatch({
        type: "SEND_ALL",
        payload: { pacienteNombre: paciente, pacienteMeta: meta },
      }),

    dispatchRxFromFarmacia: (id) =>
      dispatch({ type: "DESPACHAR_RX", payload: { id } }),

    discontinueRx: (id, motivo, observacion) =>
      dispatch({
        type: "DESCONTINUAR_RX",
        payload: { id, motivo, observacion },
      }),

    registrarDosis: (id, tipo, hora) =>
      dispatch({
        type: "REGISTRAR_DOSIS",
        payload: { id, tipo, hora },
      }),

    eliminarDosis: (id, index) =>
      dispatch({
        type: "ELIMINAR_DOSIS",
        payload: { id, index },
      }),

    confirmarDevolucion: (id) =>
      dispatch({
        type: "CONFIRMAR_DEVOLUCION",
        payload: { id },
      }),

    resetPrescripciones: () => dispatch({ type: "RESET" }),
  };
}
