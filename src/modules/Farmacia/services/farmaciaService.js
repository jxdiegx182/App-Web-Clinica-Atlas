import { supabase } from "@/lib/supabaseClient.js";
import { farmaciaSeedInventory } from "../constants/farmaciaSeed";
import { costoUnitario, loteMasProximo, stockTotal } from "../utils/farmaciaHelpers";

const LOCAL_KEYS = {
  inventory: "atlas_farmacia_inventory_v1",
  history: "atlas_farmacia_history_v1",
  ingresos: "atlas_farmacia_ingresos_v1",
  sales: "atlas_farmacia_sales_v1",
};

const INVENTORY_TABLE =
  import.meta.env.VITE_SUPABASE_FARMACIA_INVENTARIO_TABLE || "farmacia_inventario";
const MOVEMENTS_TABLE =
  import.meta.env.VITE_SUPABASE_FARMACIA_MOVIMIENTOS_TABLE || "farmacia_movimientos";
const INGRESOS_TABLE =
  import.meta.env.VITE_SUPABASE_FARMACIA_INGRESOS_TABLE || "farmacia_ingresos";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalJson(key, fallback) {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("No se pudo leer local storage de farmacia:", error);
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function toSupabaseInventoryRow(item) {
  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    concentracion: item.concentracion || null,
    tipo: item.tipo || "med",
    min_stock: Number(item.min || 0),
    bodega: item.bodega || "Farmacia Central",
    talla: item.talla || null,
    serie: item.serie || null,
    stock_total: stockTotal(item),
    costo_unitario: Number(costoUnitario(item) || 0),
    vencimiento_proximo: loteMasProximo(item)?.venc || null,
    lotes_json: item.lotes || [],
    updated_at: new Date().toISOString(),
  };
}

async function tryLoadInventoryFromSupabase() {
  const { data, error } = await supabase
    .from(INVENTORY_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return null;
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((row) => ({
    id: row.id,
    codigo: row.codigo || "",
    nombre: row.nombre || "",
    concentracion: row.concentracion || "—",
    tipo: row.tipo || "med",
    min: Number(row.min_stock || 0),
    bodega: row.bodega || "Farmacia Central",
    talla: row.talla || "",
    serie: row.serie || "",
    lotes: Array.isArray(row.lotes_json) ? row.lotes_json : [],
  }));
}

async function tryPersistInventoryToSupabase(inventory) {
  try {
    const rows = inventory.map(toSupabaseInventoryRow);
    const { error } = await supabase.from(INVENTORY_TABLE).upsert(rows);
    if (error && error.code !== "42P01") {
      console.warn("No se pudo sincronizar inventario de farmacia en Supabase:", error);
    }
  } catch (error) {
    console.warn("Sincronización Supabase inventario omitida:", error);
  }
}

async function tryInsertSupabaseMovement(table, payload) {
  try {
    const { error } = await supabase.from(table).insert([payload]);
    if (error && error.code !== "42P01") {
      console.warn(`No se pudo guardar ${table} en Supabase:`, error);
    }
  } catch (error) {
    console.warn(`Sincronización Supabase ${table} omitida:`, error);
  }
}

export async function loadFarmaciaState() {
  let inventory = readLocalJson(LOCAL_KEYS.inventory, null);

  if (!inventory) {
    try {
      const supabaseInventory = await tryLoadInventoryFromSupabase();
      if (Array.isArray(supabaseInventory) && supabaseInventory.length > 0) {
        inventory = supabaseInventory;
      }
    } catch (error) {
      console.warn("Carga de inventario de farmacia desde Supabase omitida:", error);
    }
  }

  if (!Array.isArray(inventory) || inventory.length === 0) {
    inventory = farmaciaSeedInventory;
  }

  const history = readLocalJson(LOCAL_KEYS.history, []);
  const ingresos = readLocalJson(LOCAL_KEYS.ingresos, []);
  const sales = readLocalJson(LOCAL_KEYS.sales, []);

  return { inventory, history, ingresos, sales };
}

export async function persistFarmaciaState({ inventory, history, ingresos, sales }) {
  if (Array.isArray(inventory)) {
    writeLocalJson(LOCAL_KEYS.inventory, inventory);
    await tryPersistInventoryToSupabase(inventory);
  }

  if (Array.isArray(history)) {
    writeLocalJson(LOCAL_KEYS.history, history);
  }

  if (Array.isArray(ingresos)) {
    writeLocalJson(LOCAL_KEYS.ingresos, ingresos);
  }

  if (Array.isArray(sales)) {
    writeLocalJson(LOCAL_KEYS.sales, sales);
  }
}

export async function appendFarmaciaMovement(movement) {
  await tryInsertSupabaseMovement(MOVEMENTS_TABLE, {
    created_at: movement.fechaHora || new Date().toISOString(),
    tipo_movimiento: movement.tipo || "MOVIMIENTO",
    item_nombre: movement.item || movement.medicamento || "Item",
    cantidad: Number(movement.cantidad || movement.cant || 0),
    costo_total: Number(movement.costoTotal || movement.total || 0),
    cama: movement.cama || null,
    paciente: movement.paciente || null,
    bodega: movement.bodega || null,
    payload_json: movement,
  });
}

export async function appendFarmaciaIngreso(ingreso) {
  await tryInsertSupabaseMovement(INGRESOS_TABLE, {
    created_at: ingreso.fechaHora || new Date().toISOString(),
    item_nombre: ingreso.item || ingreso.medicamento || "Item",
    cantidad: Number(ingreso.cantidad || ingreso.cant || 0),
    costo_total: Number(ingreso.costoTotal || ingreso.total || 0),
    proveedor: ingreso.proveedor || null,
    bodega: ingreso.bodega || null,
    payload_json: ingreso,
  });
}
