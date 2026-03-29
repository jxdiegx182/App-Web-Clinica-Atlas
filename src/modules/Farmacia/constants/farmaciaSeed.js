import farmaciaHtmlRaw from "../Farmacia.html?raw";

function safeEvalArray(segment, fallback = []) {
  if (!segment) return fallback;

  try {
    // Confiamos solo en el HTML local del proyecto para reaprovechar sus datos semilla.
    return new Function(`return [${segment}];`)();
  } catch (error) {
    console.error("No se pudo parsear seed de farmacia:", error);
    return fallback;
  }
}

function safeEvalExpression(segment, fallback) {
  if (!segment) return fallback;

  try {
    return new Function(`return (${segment});`)();
  } catch (error) {
    console.error("No se pudo parsear expresión seed de farmacia:", error);
    return fallback;
  }
}

function extractBetween(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  if (start < 0) return "";

  const sourceFromStart = source.slice(start);
  const endMatch = sourceFromStart.match(endPattern);
  if (!endMatch) return "";

  const endIndex = sourceFromStart.indexOf(endMatch[0]);
  return sourceFromStart.slice(0, endIndex);
}

const inventarioSegmentMatch = farmaciaHtmlRaw.match(/inventario:\s*\[(.*?)\],\s*pedidos:/s);
const pedidosSegmentMatch = farmaciaHtmlRaw.match(/pedidos:\s*\[(.*?)\],\s*camas:/s);
const camasSegmentMatch = farmaciaHtmlRaw.match(/camas:\s*\[(.*?)\],\s*historial:/s);
const bodegasSegmentMatch = farmaciaHtmlRaw.match(/bodegas:\s*(\[[^\]]*\])/s);
const equipmentPushMatch = farmaciaHtmlRaw.match(/db\.inventario\.push\((.*?)\);\s*\/\/ ═/s);

const baseInventario = safeEvalArray(inventarioSegmentMatch?.[1]);
const equipmentInventario = safeEvalArray(equipmentPushMatch?.[1]);

export const farmaciaSeedInventory = [...baseInventario, ...equipmentInventario];
export const farmaciaSeedPedidos = safeEvalArray(pedidosSegmentMatch?.[1]);
export const farmaciaSeedCamas = safeEvalArray(camasSegmentMatch?.[1]);
export const farmaciaSeedBodegas = safeEvalExpression(
  bodegasSegmentMatch?.[1],
  [
    "Farmacia Central",
    "UCI",
    "Quirófano",
    "Neonatología",
    "Emergencia",
    "Hospitalización",
    "Rx / Rayos X",
    "Endoscopía",
  ]
);
