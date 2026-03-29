export const INVENTORY_TYPES = [
  { key: "med", label: "Medicamentos", icon: "💊", accent: "#2a9d8f" },
  { key: "ins", label: "Insumos Médicos", icon: "🩺", accent: "#3182ce" },
  { key: "imp", label: "Implantes Médicos", icon: "🦴", accent: "#b7791f" },
  { key: "equ", label: "Equipamiento Médico", icon: "⚙️", accent: "#553c9a" },
];

export const POS_PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
];

export function stockTotal(item = {}) {
  return Array.isArray(item.lotes)
    ? item.lotes.reduce((acc, lote) => acc + Number(lote.stock || 0), 0)
    : Number(item.stock || 0);
}

export function sortLotesFefo(lotes = []) {
  return [...lotes].sort((a, b) => new Date(a.venc || "2099-12-31") - new Date(b.venc || "2099-12-31"));
}

export function loteMasProximo(item = {}) {
  const lotes = sortLotesFefo(item.lotes || []).filter((lote) => Number(lote.stock || 0) > 0);
  return lotes[0] || null;
}

export function costoUnitario(item = {}) {
  return Number(loteMasProximo(item)?.costo || item.costo || item.precio || 0);
}

export function lotesSummary(item = {}) {
  if (!Array.isArray(item.lotes) || item.lotes.length === 0) return "—";
  const summary = item.lotes
    .filter((lote) => Number(lote.stock || 0) > 0)
    .map((lote) => `${lote.idLote}(${Number(lote.stock || 0)})`)
    .join(" · ");
  return summary || "Sin stock";
}

export function getStockTone(item = {}) {
  const total = stockTotal(item);
  const min = Number(item.min || 0);
  if (total <= 0) return "crit";
  if (total < min) return "bajo";
  return "ok";
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMonth(value) {
  if (!value) return "—";
  const parsed = `${value}`.length === 7 ? `${value}-01` : value;
  const date = new Date(parsed);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit" });
}

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function createInventoryId() {
  return `farm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createMovementId(prefix = "mov") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapOrderStatusToHtml(status) {
  if (status === "despachada") return "desp";
  if (status === "urgente") return "urg";
  return "pend";
}

export function matchInventoryItem(inventory = [], query = {}) {
  const targetName = normalizeText(query.nom || query.med || query.item_nombre || query.item);
  const targetConcentration = normalizeText(query.conc || query.concentracion);

  if (!targetName) return null;

  return (
    inventory.find((item) => {
      const sameName = normalizeText(item.nombre) === targetName;
      if (!sameName) return false;
      if (!targetConcentration) return true;
      return normalizeText(item.concentracion).includes(targetConcentration);
    }) ||
    inventory.find((item) => normalizeText(item.nombre) === targetName) ||
    inventory.find((item) => normalizeText(item.codigo) === targetName)
  );
}

export function decrementInventoryByQuantity(item, quantity) {
  const requested = Number(quantity || 0);
  if (requested <= 0) {
    return {
      item,
      lotesUsados: [],
      totalDespachado: 0,
      remainingRequested: 0,
    };
  }

  const nextItem = {
    ...item,
    lotes: sortLotesFefo(item.lotes || []).map((lote) => ({ ...lote })),
  };

  let remainingRequested = requested;
  const lotesUsados = [];

  nextItem.lotes.forEach((lote) => {
    if (remainingRequested <= 0) return;
    const stock = Number(lote.stock || 0);
    if (stock <= 0) return;

    const despachar = Math.min(stock, remainingRequested);
    lote.stock = stock - despachar;
    remainingRequested -= despachar;

    lotesUsados.push({
      idLote: lote.idLote,
      cant: despachar,
      costo: Number(lote.costo || 0),
      venc: lote.venc || null,
    });
  });

  return {
    item: nextItem,
    lotesUsados,
    totalDespachado: requested - remainingRequested,
    remainingRequested,
  };
}

export function createDispatchMovement(order, inventoryItem, lotesUsados = [], overrides = {}) {
  const total = lotesUsados.reduce((acc, lote) => acc + Number(lote.cant || 0), 0);
  const totalCost = lotesUsados.reduce(
    (acc, lote) => acc + Number(lote.costo || 0) * Number(lote.cant || 0),
    0
  );

  return {
    id: createMovementId("disp"),
    fechaHora: new Date().toISOString(),
    tipo: "EGRESO_DESPACHO",
    item: inventoryItem?.nombre || order?.nom || order?.med || "Medicamento",
    medicamento: inventoryItem?.nombre || order?.nom || order?.med || "Medicamento",
    bodega: overrides.bodega || inventoryItem?.bodega || "Farmacia Central",
    cama: overrides.cama || order?.cama || order?.admisionId || "—",
    paciente: overrides.paciente || order?.paciente || "Paciente",
    medico: overrides.medico || order?.medico || "—",
    cantidad: total,
    cant: total,
    costoTotal: Number(totalCost.toFixed(2)),
    total: Number(totalCost.toFixed(2)),
    lote: lotesUsados.map((lote) => `${lote.idLote}×${lote.cant}`).join(" + ") || "—",
    lotes: lotesUsados,
    responsable: "Farmacia Central",
    resp: "Farmacia Central",
    verificacion: "Despacho React FEFO",
    pedidoId: order?.pedidoId || null,
    rxId: order?.id || null,
  };
}

export function createIngresoMovement(form, item, lote) {
  const cantidad = Number(form.cantidad || 0);
  const precio = Number(form.precio || lote?.costo || 0);
  return {
    id: createMovementId("ing"),
    fechaHora: new Date().toISOString(),
    tipo: "INGRESO_STOCK",
    item: item.nombre,
    medicamento: item.nombre,
    bodega: item.bodega || form.bodega || "Farmacia Central",
    cantidad,
    cant: cantidad,
    costoTotal: Number((cantidad * precio).toFixed(2)),
    total: Number((cantidad * precio).toFixed(2)),
    lote: lote?.idLote || "—",
    responsable: "Farmacia Central",
    resp: "Farmacia Central",
    proveedor: form.proveedor || "—",
    verificacion: "Ingreso React",
  };
}

export function deriveCamasFromOrders(orders = [], seedBeds = []) {
  const bedMap = new Map();

  seedBeds.forEach((bed) => {
    bedMap.set(bed.id, { ...bed, pedidos: 0, urgente: false });
  });

  orders.forEach((order) => {
    const camaId = order.cama || order.admisionId || `ADM-${order.admisionId || order.id}`;
    const existing = bedMap.get(camaId) || {
      id: camaId,
      area: order.area || order.bodega || "Farmacia Central",
      estado: "ocupado",
      paciente: order.paciente || "Paciente",
      diagnostico: order.medico || "Sin diagnóstico",
      pedidos: 0,
      urgente: false,
    };

    bedMap.set(camaId, {
      ...existing,
      estado: order.paciente ? "ocupado" : existing.estado,
      paciente: order.paciente || existing.paciente || null,
      diagnostico: order.medico || existing.diagnostico || null,
      pedidos: Number(existing.pedidos || 0) + (order.status !== "despachada" ? 1 : 0),
      urgente: existing.urgente || Boolean(order.urgente),
    });
  });

  return [...bedMap.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

export function buildKpis({ orders = [], inventory = [], history = [], sales = [] }) {
  const pendientes = orders.filter((order) => order.status !== "despachada").length;
  const urgentes = orders.filter((order) => order.status !== "despachada" && order.urgente).length;
  const despachados = history.filter((entry) => entry.tipo === "EGRESO_DESPACHO").length;
  const bajo = inventory.filter((item) => {
    const total = stockTotal(item);
    return total > 0 && total < Number(item.min || 0);
  }).length;
  const sinStock = inventory.filter((item) => stockTotal(item) <= 0).length;
  const consumoTurno = history
    .filter((entry) => entry.tipo === "EGRESO_DESPACHO")
    .reduce((acc, entry) => acc + Number(entry.costoTotal || entry.total || 0), 0);
  const ventaDiaria = sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);

  return {
    pendientes,
    urgentes,
    despachados,
    bajo,
    sinStock,
    consumoTurno,
    ventaDiaria,
  };
}

export function groupInventoryByType(inventory = []) {
  return INVENTORY_TYPES.reduce((acc, type) => {
    acc[type.key] = inventory.filter((item) => (item.tipo || "med") === type.key);
    return acc;
  }, {});
}

export function buildInventorySearchMatches(inventory = [], term = "") {
  const normalized = normalizeText(term);
  if (!normalized) return inventory;

  return inventory.filter((item) =>
    normalizeText(
      `${item.codigo} ${item.nombre} ${item.concentracion} ${item.bodega} ${item.talla} ${item.serie}`
    ).includes(normalized)
  );
}

export function createInventoryItemFromForm(form) {
  const tipo = form.tipo || "med";
  const loteId =
    form.lote?.trim() ||
    `L-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const lote = {
    idLote: loteId,
    stock: Number(form.stock || form.cantidad || 0),
    venc: form.venc || "2099-12-31",
    costo: Number(form.precio || 0),
  };

  return {
    id: createInventoryId(),
    codigo: form.codigo?.trim() || slugify(`${form.nombre}-${tipo}`).toUpperCase(),
    nombre: form.nombre?.trim() || "Nuevo item",
    concentracion: form.concentracion?.trim() || "—",
    tipo,
    min: Number(form.minimo || 0),
    bodega: form.bodega || "Farmacia Central",
    talla: form.talla?.trim() || "",
    serie: form.serie?.trim() || "",
    lotes: lote.stock > 0 ? [lote] : [],
  };
}

export function applyIngresoToInventory(inventory = [], form) {
  const cantidad = Number(form.cantidad || 0);
  if (cantidad <= 0) {
    return {
      inventory,
      item: null,
      lote: null,
    };
  }

  const normalizedCode = normalizeText(form.codigo);
  const normalizedName = normalizeText(form.nombre);
  const bodega = form.bodega || "Farmacia Central";

  let wasCreated = false;
  const nextInventory = inventory.map((item) => ({ ...item, lotes: [...(item.lotes || [])] }));
  let targetIndex = nextInventory.findIndex(
    (item) =>
      item.bodega === bodega &&
      ((normalizedCode && normalizeText(item.codigo) === normalizedCode) ||
        (normalizedName && normalizeText(item.nombre) === normalizedName))
  );

  if (targetIndex < 0) {
    nextInventory.unshift(createInventoryItemFromForm(form));
    targetIndex = 0;
    wasCreated = true;
  }

  const item = nextInventory[targetIndex];
  if (!Array.isArray(item.lotes)) item.lotes = [];

  const loteId =
    form.lote?.trim() ||
    `L-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const existingLote = item.lotes.find((lote) => lote.idLote === loteId);

  if (existingLote) {
    existingLote.stock = Number(existingLote.stock || 0) + cantidad;
    if (form.venc) existingLote.venc = form.venc;
    if (form.precio) existingLote.costo = Number(form.precio || 0);
  } else {
    item.lotes.push({
      idLote: loteId,
      stock: cantidad,
      venc: form.venc || "2099-12-31",
      costo: Number(form.precio || 0),
    });
  }

  item.tipo = form.tipo || item.tipo || "med";
  item.nombre = form.nombre?.trim() || item.nombre;
  item.concentracion = form.concentracion?.trim() || item.concentracion || "—";
  item.bodega = bodega;
  item.min = Number(form.minimo || item.min || 0);
  item.codigo = form.codigo?.trim() || item.codigo;
  item.talla = form.talla?.trim() || item.talla || "";
  item.serie = form.serie?.trim() || item.serie || "";

  const lote = item.lotes.find((candidate) => candidate.idLote === loteId) || null;

  return {
    inventory: nextInventory,
    item,
    lote,
    wasCreated,
  };
}

export function applyRestockToInventory(inventory = [], targetId, form) {
  const cantidad = Number(form.cantidad || 0);
  if (cantidad <= 0) return { inventory, item: null, lote: null };

  const nextInventory = inventory.map((item) => ({ ...item, lotes: [...(item.lotes || [])] }));
  const target = nextInventory.find((item) => item.id === targetId);
  if (!target) return { inventory, item: null, lote: null };

  const mode = form.modo || "mismo";
  let lote = null;

  if (mode === "mismo" && form.loteExistente) {
    lote = target.lotes.find((candidate) => candidate.idLote === form.loteExistente);
    if (lote) {
      lote.stock = Number(lote.stock || 0) + cantidad;
    }
  }

  if (!lote) {
    lote = {
      idLote:
        form.loteNuevo?.trim() ||
        `L-REPO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      stock: cantidad,
      venc: form.vencNuevo || "2099-12-31",
      costo: Number(form.precioNuevo || costoUnitario(target)),
    };
    target.lotes.push(lote);
  }

  return { inventory: nextInventory, item: target, lote };
}

export function filterBeds(beds = [], term = "", filter = "todas") {
  const normalized = normalizeText(term);

  return beds.filter((bed) => {
    if (filter === "pend" && Number(bed.pedidos || 0) === 0) return false;
    if (filter === "urg" && !bed.urgente) return false;
    if (filter === "uci" && normalizeText(bed.area) !== "uci") return false;
    if (filter === "hosp" && !normalizeText(bed.area).includes("hospital")) return false;
    if (filter === "neo" && !normalizeText(bed.area).includes("neo")) return false;
    if (filter === "qx" && !normalizeText(bed.area).includes("quirof")) return false;

    if (!normalized) return true;

    return normalizeText(`${bed.id} ${bed.paciente} ${bed.area} ${bed.diagnostico}`).includes(normalized);
  });
}
