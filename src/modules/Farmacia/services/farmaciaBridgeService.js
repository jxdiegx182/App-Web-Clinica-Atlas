const EVOLUTION_STORAGE_PREFIX = "atlas_evolucion_prescripciones_v2:";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStateFromStorageKey(storageKey) {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("No se pudo leer storage de evolución para farmacia:", error);
    return null;
  }
}

function writeStateToStorageKey(storageKey, payload) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("atlas:farmacia-sync"));
}

function toOrder(item, storageKey) {
  const urgente = Boolean(item.urgente);
  return {
    ...item,
    id: item.id,
    pedidoId: item.pedidoId || `${storageKey}:${item.id}`,
    sourceStorageKey: storageKey,
    paciente: item.paciente || "Paciente",
    cama: item.cama || item.habitacion || item.admisionId || "—",
    medico: item.medico || "—",
    bodega: item.bodega || "Farmacia Central",
    status: item.status || "enviada",
    urgente,
    estado: urgente ? "urg" : item.status === "despachada" ? "desp" : "pend",
    med: item.nom || item.med || "Medicamento",
    item_nombre: item.nom || item.med || "Medicamento",
  };
}

export function readFarmaciaPedidosFromEvolutionStorage() {
  if (!canUseStorage()) return [];

  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith(EVOLUTION_STORAGE_PREFIX))
    .flatMap((storageKey) => {
      const state = readStateFromStorageKey(storageKey);
      if (!state || !Array.isArray(state.farmaciaQueue)) return [];
      return state.farmaciaQueue.map((item) => toOrder(item, storageKey));
    })
    .sort((a, b) => {
      if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
      return String(a.hora || "").localeCompare(String(b.hora || ""));
    });
}

export function updateEvolutionPedidoStatus(order, status) {
  if (!order?.sourceStorageKey) return;

  const state = readStateFromStorageKey(order.sourceStorageKey);
  if (!state) return;

  const nextState = {
    ...state,
    rxList: Array.isArray(state.rxList)
      ? state.rxList.map((rx) =>
          rx.id === order.id
            ? {
                ...rx,
                status,
                totalDespachado:
                  status === "despachada"
                    ? Number(order.farmUnidades || order.cant || rx.totalDespachado || 1)
                    : rx.totalDespachado,
              }
            : rx
        )
      : [],
    farmaciaQueue: Array.isArray(state.farmaciaQueue)
      ? state.farmaciaQueue.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status,
              }
            : item
        )
      : [],
  };

  writeStateToStorageKey(order.sourceStorageKey, nextState);
}

export function subscribeFarmaciaBridge(onChange) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("atlas:farmacia-sync", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("atlas:farmacia-sync", handler);
  };
}
