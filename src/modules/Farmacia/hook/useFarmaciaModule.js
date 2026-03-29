import { useCallback, useEffect, useMemo, useState } from "react";
import { farmaciaSeedBodegas, farmaciaSeedCamas } from "../constants/farmaciaSeed";
import {
  readFarmaciaPedidosFromEvolutionStorage,
  subscribeFarmaciaBridge,
  updateEvolutionPedidoStatus,
} from "../services/farmaciaBridgeService";
import {
  appendFarmaciaIngreso,
  appendFarmaciaMovement,
  loadFarmaciaState,
  persistFarmaciaState,
} from "../services/farmaciaService";
import {
  INVENTORY_TYPES,
  POS_PAYMENT_OPTIONS,
  applyIngresoToInventory,
  applyRestockToInventory,
  buildInventorySearchMatches,
  buildKpis,
  costoUnitario,
  createDispatchMovement,
  createInventoryItemFromForm,
  decrementInventoryByQuantity,
  deriveCamasFromOrders,
  filterBeds,
  formatDateTime,
  formatMoney,
  getStockTone,
  groupInventoryByType,
  lotesSummary,
  loteMasProximo,
  matchInventoryItem,
  stockTotal,
} from "../utils/farmaciaHelpers";

const INITIAL_NEW_ITEM_FORM = {
  codigo: "",
  nombre: "",
  concentracion: "",
  tipo: "med",
  minimo: 0,
  bodega: "Farmacia Central",
  stock: 0,
  precio: 0,
  lote: "",
  venc: "",
  talla: "",
  serie: "",
};

const INITIAL_INGRESO_FORM = {
  codigo: "",
  nombre: "",
  concentracion: "",
  tipo: "med",
  cantidad: "",
  precio: "",
  lote: "",
  venc: "",
  bodega: "Farmacia Central",
  proveedor: "",
  talla: "",
  serie: "",
  minimo: 0,
};

const INITIAL_RESTOCK_FORM = {
  modo: "mismo",
  loteExistente: "",
  loteNuevo: "",
  vencNuevo: "",
  precioNuevo: "",
  cantidad: "",
};

const INITIAL_POS_FORM = {
  cedula: "",
  nombre: "",
  direccion: "",
  pago: "efectivo",
};

function makeToast(message, tone = "t") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message,
    tone,
  };
}

export default function useFarmaciaModule() {
  const [activeTab, setActiveTab] = useState("desp");
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshOrdersTick, setRefreshOrdersTick] = useState(0);
  const [searchDesp, setSearchDesp] = useState("");
  const [searchBeds, setSearchBeds] = useState("");
  const [searchInventory, setSearchInventory] = useState("");
  const [searchHistory, setSearchHistory] = useState("");
  const [searchPos, setSearchPos] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("todos");
  const [bedsFilter, setBedsFilter] = useState("todas");
  const [newItemForm, setNewItemForm] = useState(INITIAL_NEW_ITEM_FORM);
  const [ingresoForm, setIngresoForm] = useState(INITIAL_INGRESO_FORM);
  const [restockForm, setRestockForm] = useState(INITIAL_RESTOCK_FORM);
  const [posForm, setPosForm] = useState(INITIAL_POS_FORM);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [restockTargetId, setRestockTargetId] = useState(null);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [cart, setCart] = useState([]);
  const [saleReceiptCounter, setSaleReceiptCounter] = useState(1000);

  const showToast = useCallback((message, tone = "t") => {
    setToast(makeToast(message, tone));
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      try {
        const initial = await loadFarmaciaState();
        if (!active) return;
        setInventory(initial.inventory || []);
        setHistory(initial.history || []);
        setIngresos(initial.ingresos || []);
        setSales(initial.sales || []);
      } catch (error) {
        console.error("No se pudo cargar Farmacia:", error);
        if (active) showToast("No se pudo cargar farmacia", "r");
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [showToast]);

  useEffect(() => {
    const unsubscribe = subscribeFarmaciaBridge(() => {
      setRefreshOrdersTick((tick) => tick + 1);
    });

    const interval = window.setInterval(() => {
      setClock(new Date());
      setRefreshOrdersTick((tick) => tick + 1);
    }, 1000);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const orders = useMemo(
    () => readFarmaciaPedidosFromEvolutionStorage(),
    [refreshOrdersTick]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status !== "despachada"),
    [orders]
  );

  const dispatchSearch = useMemo(() => {
    const normalized = searchDesp.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter((order) =>
      `${order.cama} ${order.paciente} ${order.medico} ${order.nom || order.med} ${order.conc}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [orders, searchDesp]);

  const beds = useMemo(
    () => deriveCamasFromOrders(orders, farmaciaSeedCamas),
    [orders]
  );

  const filteredBeds = useMemo(
    () => filterBeds(beds, searchBeds, bedsFilter),
    [beds, searchBeds, bedsFilter]
  );

  const inventoryFilteredBase = useMemo(() => {
    let items = buildInventorySearchMatches(inventory, searchInventory);

    if (inventoryFilter === "bajo") {
      items = items.filter((item) => {
        const total = stockTotal(item);
        return total > 0 && total < Number(item.min || 0);
      });
    }

    if (inventoryFilter === "crit") {
      items = items.filter((item) => stockTotal(item) <= 0);
    }

    return items;
  }, [inventory, inventoryFilter, searchInventory]);

  const inventoryByType = useMemo(
    () => groupInventoryByType(inventoryFilteredBase),
    [inventoryFilteredBase]
  );

  const criticalInventory = useMemo(
    () =>
      inventory
        .filter((item) => getStockTone(item) !== "ok")
        .sort((a, b) => stockTotal(a) - stockTotal(b)),
    [inventory]
  );

  const historyRows = useMemo(() => {
    const normalized = searchHistory.trim().toLowerCase();
    const rows = [...history].sort(
      (a, b) => new Date(b.fechaHora || b.fecha || 0) - new Date(a.fechaHora || a.fecha || 0)
    );

    if (!normalized) return rows;

    return rows.filter((row) =>
      `${row.tipo} ${row.item} ${row.paciente} ${row.bodega} ${row.lote} ${row.cama}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [history, searchHistory]);

  const posMatches = useMemo(() => {
    const term = searchPos.trim();
    if (term.length < 2) return [];
    return buildInventorySearchMatches(inventory, term).slice(0, 8);
  }, [inventory, searchPos]);

  const kpis = useMemo(
    () => buildKpis({ orders, inventory, history, sales }),
    [orders, inventory, history, sales]
  );

  const persistAll = useCallback(
    async (nextInventory, nextHistory, nextIngresos = ingresos, nextSales = sales) => {
      setInventory(nextInventory);
      setHistory(nextHistory);
      setIngresos(nextIngresos);
      setSales(nextSales);
      await persistFarmaciaState({
        inventory: nextInventory,
        history: nextHistory,
        ingresos: nextIngresos,
        sales: nextSales,
      });
    },
    [ingresos, sales]
  );

  const executeDispatch = useCallback(
    async (order, currentInventory, currentHistory) => {
      const target = matchInventoryItem(currentInventory, order);
      if (!target) {
        showToast(`Producto no encontrado en inventario: ${order.nom || order.med}`, "r");
        return { inventory: currentInventory, history: currentHistory, success: false };
      }

      const requiredUnits = Number(order.farmUnidades || order.cant || 1);
      if (stockTotal(target) < requiredUnits) {
        showToast(
          `Stock insuficiente para ${target.nombre}. Disponible: ${stockTotal(target)}`,
          "r"
        );
        return { inventory: currentInventory, history: currentHistory, success: false };
      }

      const result = decrementInventoryByQuantity(target, requiredUnits);
      if (result.remainingRequested > 0) {
        showToast(`No se pudo completar FEFO para ${target.nombre}`, "r");
        return { inventory: currentInventory, history: currentHistory, success: false };
      }

      const nextInventory = currentInventory.map((item) =>
        item.id === target.id ? result.item : item
      );

      const movement = createDispatchMovement(order, target, result.lotesUsados, {
        paciente: order.paciente,
        cama: order.cama,
        medico: order.medico,
      });

      const nextHistory = [movement, ...currentHistory];

      await appendFarmaciaMovement(movement);
      updateEvolutionPedidoStatus(order, "despachada");

      return {
        inventory: nextInventory,
        history: nextHistory,
        success: true,
        movement,
      };
    },
    [showToast]
  );

  const handleDispatchOrder = useCallback(
    async (order) => {
      const result = await executeDispatch(order, inventory, history);
      if (!result.success) return;

      await persistAll(result.inventory, result.history);
      setRefreshOrdersTick((tick) => tick + 1);
      showToast(`✅ ${result.movement.item} despachado`, "g");
    },
    [executeDispatch, history, inventory, persistAll, showToast]
  );

  const handleDispatchAll = useCallback(async () => {
    if (pendingOrders.length === 0) {
      showToast("Sin pedidos pendientes", "a");
      return;
    }

    let workingInventory = inventory;
    let workingHistory = history;
    let successCount = 0;

    for (const order of pendingOrders) {
      const result = await executeDispatch(order, workingInventory, workingHistory);
      if (!result.success) continue;
      successCount += 1;
      workingInventory = result.inventory;
      workingHistory = result.history;
    }

    await persistAll(workingInventory, workingHistory);
    setRefreshOrdersTick((tick) => tick + 1);

    showToast(
      successCount > 0
        ? `✅ ${successCount} pedido(s) despachados`
        : "No se pudo despachar ningún pedido",
      successCount > 0 ? "g" : "a"
    );
  }, [executeDispatch, history, inventory, pendingOrders, persistAll, showToast]);

  const handleCreateNewItem = useCallback(async () => {
    const item = createInventoryItemFromForm(newItemForm);
    const nextInventory = [item, ...inventory];
    await persistAll(nextInventory, history);
    setNewItemForm(INITIAL_NEW_ITEM_FORM);
    setNewItemOpen(false);
    showToast(`✅ ${item.nombre} agregado al inventario`, "g");
  }, [history, inventory, newItemForm, persistAll, showToast]);

  const handleRegisterIngreso = useCallback(async () => {
    const result = applyIngresoToInventory(inventory, ingresoForm);
    if (!result.item || !result.lote) {
      showToast("Ingrese una cantidad válida para registrar el ingreso", "r");
      return;
    }

    const movement = {
      id: `ing-${Date.now()}`,
      fechaHora: new Date().toISOString(),
      item: result.item.nombre,
      medicamento: result.item.nombre,
      cantidad: Number(ingresoForm.cantidad || 0),
      cant: Number(ingresoForm.cantidad || 0),
      precio: Number(ingresoForm.precio || result.lote.costo || 0),
      costoTotal: Number(
        (Number(ingresoForm.cantidad || 0) * Number(ingresoForm.precio || result.lote.costo || 0)).toFixed(
          2
        )
      ),
      total: Number(
        (Number(ingresoForm.cantidad || 0) * Number(ingresoForm.precio || result.lote.costo || 0)).toFixed(
          2
        )
      ),
      lote: result.lote.idLote,
      proveedor: ingresoForm.proveedor || "—",
      bodega: result.item.bodega || ingresoForm.bodega || "Farmacia Central",
      tipo: "INGRESO_STOCK",
      responsable: "Farmacia Central",
      verificacion: "Ingreso React",
    };

    const nextIngresos = [movement, ...ingresos];
    const nextHistory = [movement, ...history];

    await appendFarmaciaIngreso(movement);
    await appendFarmaciaMovement(movement);
    await persistAll(result.inventory, nextHistory, nextIngresos);

    setIngresoForm(INITIAL_INGRESO_FORM);
    showToast(`✅ Ingreso registrado para ${result.item.nombre}`, "g");
  }, [history, ingresoForm, ingresos, inventory, persistAll, showToast]);

  const handleLookupIngresoCode = useCallback(() => {
    const code = ingresoForm.codigo?.trim();
    if (!code) return;

    const found = inventory.find((item) => item.codigo?.toLowerCase() === code.toLowerCase());
    if (!found) {
      showToast(`Código "${code}" no registrado. Puede crear el producto o ingresar manualmente.`, "a");
      return;
    }

    setIngresoForm((prev) => ({
      ...prev,
      nombre: found.nombre,
      concentracion: found.concentracion || "",
      tipo: found.tipo || "med",
      bodega: found.bodega || "Farmacia Central",
      minimo: found.min || 0,
      precio: costoUnitario(found),
      lote: loteMasProximo(found)?.idLote || "",
      venc: loteMasProximo(found)?.venc?.slice?.(0, 7) || "",
      talla: found.talla || "",
      serie: found.serie || "",
    }));

    showToast(`✅ ${found.nombre} encontrado en inventario`, "g");
  }, [ingresoForm.codigo, inventory, showToast]);

  const handleOpenRestock = useCallback((item) => {
    setRestockTargetId(item?.id || null);
    setRestockForm({
      modo: Array.isArray(item?.lotes) && item.lotes.length > 0 ? "mismo" : "nuevo",
      loteExistente: item?.lotes?.[0]?.idLote || "",
      loteNuevo: "",
      vencNuevo: "",
      precioNuevo: "",
      cantidad: "",
    });
  }, []);

  const handleConfirmRestock = useCallback(async () => {
    const result = applyRestockToInventory(inventory, restockTargetId, restockForm);
    if (!result.item || !result.lote) {
      showToast("No se pudo registrar el restock", "r");
      return;
    }

    const movement = {
      id: `rest-${Date.now()}`,
      fechaHora: new Date().toISOString(),
      item: result.item.nombre,
      medicamento: result.item.nombre,
      cantidad: Number(restockForm.cantidad || 0),
      cant: Number(restockForm.cantidad || 0),
      precio: Number(restockForm.precioNuevo || result.lote.costo || 0),
      costoTotal: Number(
        (
          Number(restockForm.cantidad || 0) *
          Number(restockForm.precioNuevo || result.lote.costo || 0)
        ).toFixed(2)
      ),
      total: Number(
        (
          Number(restockForm.cantidad || 0) *
          Number(restockForm.precioNuevo || result.lote.costo || 0)
        ).toFixed(2)
      ),
      lote: result.lote.idLote,
      proveedor: "Restock interno",
      bodega: result.item.bodega || "Farmacia Central",
      tipo: "INGRESO_RESTOCK",
      responsable: "Farmacia Central",
      verificacion: "Restock React",
    };

    const nextIngresos = [movement, ...ingresos];
    const nextHistory = [movement, ...history];
    await appendFarmaciaIngreso(movement);
    await appendFarmaciaMovement(movement);
    await persistAll(result.inventory, nextHistory, nextIngresos);

    setRestockTargetId(null);
    setRestockForm(INITIAL_RESTOCK_FORM);
    showToast(`✅ Stock actualizado para ${result.item.nombre}`, "g");
  }, [history, ingresos, inventory, persistAll, restockForm, restockTargetId, showToast]);

  const handleAddCartItem = useCallback(
    (item) => {
      const available = stockTotal(item);
      if (available <= 0) {
        showToast(`Sin stock disponible para ${item.nombre}`, "r");
        return;
      }

      setCart((prev) => {
        const existing = prev.find((entry) => entry.id === item.id);
        if (existing) {
          if (existing.cant >= available) {
            showToast(`Stock máximo disponible: ${available}`, "a");
            return prev;
          }

          return prev.map((entry) =>
            entry.id === item.id ? { ...entry, cant: entry.cant + 1 } : entry
          );
        }

        return [
          ...prev,
          {
            id: item.id,
            nombre: item.nombre,
            codigo: item.codigo,
            tipo: item.tipo || "med",
            cant: 1,
            pvp: Number((costoUnitario(item) * 1.3).toFixed(2)),
            aplicaIva: item.tipo !== "med",
            bodega: item.bodega || "Farmacia Central",
            lote: loteMasProximo(item)?.idLote || "—",
          },
        ];
      });

      showToast(`✅ ${item.nombre} añadido al carrito`, "g");
      setSearchPos("");
    },
    [showToast]
  );

  const handleChangeCartQty = useCallback(
    (itemId, delta) => {
      setCart((prev) => {
        const current = prev.find((entry) => entry.id === itemId);
        if (!current) return prev;

        const inventoryItem = inventory.find((entry) => entry.id === itemId);
        const available = stockTotal(inventoryItem);
        const nextQty = current.cant + delta;

        if (nextQty <= 0) {
          return prev.filter((entry) => entry.id !== itemId);
        }

        if (nextQty > available) {
          showToast(`Stock máximo disponible: ${available}`, "a");
          return prev;
        }

        return prev.map((entry) =>
          entry.id === itemId ? { ...entry, cant: nextQty } : entry
        );
      });
    },
    [inventory, showToast]
  );

  const handleFinalizeSale = useCallback(async () => {
    if (cart.length === 0) {
      showToast("El carrito está vacío", "r");
      return;
    }

    let workingInventory = inventory;
    let workingHistory = history;
    const receipt = `REC-${saleReceiptCounter + 1}`;
    const clientName = posForm.nombre?.trim() || "Consumidor Final";
    const totalRows = [];

    for (const cartItem of cart) {
      const inventoryItem = workingInventory.find((entry) => entry.id === cartItem.id);
      if (!inventoryItem || stockTotal(inventoryItem) < cartItem.cant) {
        showToast(`Stock insuficiente para ${cartItem.nombre}`, "r");
        return;
      }

      const result = decrementInventoryByQuantity(inventoryItem, cartItem.cant);
      workingInventory = workingInventory.map((entry) =>
        entry.id === inventoryItem.id ? result.item : entry
      );

      const subtotal = Number((cartItem.pvp * cartItem.cant).toFixed(2));
      const iva = cartItem.aplicaIva ? Number((subtotal * 0.15).toFixed(2)) : 0;
      const total = Number((subtotal + iva).toFixed(2));

      totalRows.push({
        id: `sale-${Date.now()}-${cartItem.id}`,
        fechaHora: new Date().toISOString(),
        tipo: "VENTA_EXTERNA",
        item: cartItem.nombre,
        medicamento: cartItem.nombre,
        bodega: cartItem.bodega,
        cama: "POS",
        paciente: clientName,
        cantidad: cartItem.cant,
        cant: cartItem.cant,
        costoTotal: total,
        total,
        lote: result.lotesUsados.map((lote) => `${lote.idLote}×${lote.cant}`).join(" + ") || "—",
        responsable: "Caja Farmacia",
        verificacion: receipt,
        formaPago: posForm.pago,
      });
    }

    const nextHistory = [...totalRows, ...workingHistory];
    const sale = {
      recibo: receipt,
      fechaHora: new Date().toISOString(),
      cliente: clientName,
      cedula: posForm.cedula || "9999999999",
      direccion: posForm.direccion || "—",
      pago: posForm.pago,
      total: totalRows.reduce((acc, row) => acc + Number(row.total || 0), 0),
      items: cart,
    };
    const nextSales = [sale, ...sales];

    for (const row of totalRows) {
      await appendFarmaciaMovement(row);
    }

    await persistAll(workingInventory, nextHistory, ingresos, nextSales);

    setCart([]);
    setPosForm(INITIAL_POS_FORM);
    setSaleReceiptCounter((counter) => counter + 1);
    showToast(`✅ Venta ${receipt} finalizada`, "g");
  }, [
    cart,
    history,
    ingresos,
    inventory,
    persistAll,
    posForm,
    saleReceiptCounter,
    sales,
    showToast,
  ]);

  const handleCancelSale = useCallback(() => {
    if (cart.length === 0) {
      showToast("El carrito ya está vacío", "a");
      return;
    }

    setCart([]);
    setPosForm(INITIAL_POS_FORM);
    showToast("Venta cancelada", "r");
  }, [cart.length, showToast]);

  const handleExportHistoryCsv = useCallback(() => {
    if (historyRows.length === 0) {
      showToast("No hay movimientos para exportar", "a");
      return;
    }

    const headers = [
      "Fecha/Hora",
      "Tipo",
      "Item",
      "Bodega",
      "Cama",
      "Paciente",
      "Cantidad",
      "Costo Total",
      "Lote",
      "Responsable",
    ];

    const rows = historyRows.map((row) =>
      [
        formatDateTime(row.fechaHora || row.fecha),
        row.tipo || "",
        row.item || row.medicamento || "",
        row.bodega || "",
        row.cama || "",
        row.paciente || "",
        row.cantidad || row.cant || 0,
        Number(row.costoTotal || row.total || 0).toFixed(2),
        row.lote || "",
        row.responsable || row.resp || "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = `${headers.join(",")}\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `farmacia_historial_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast("✅ Historial exportado", "g");
  }, [historyRows, showToast]);

  const restockTarget = useMemo(
    () => inventory.find((item) => item.id === restockTargetId) || null,
    [inventory, restockTargetId]
  );

  return {
    activeTab,
    setActiveTab,
    loading,
    clock,
    toast,
    clearToast: () => setToast(null),
    showToast,
    inventory,
    inventoryByType,
    inventoryTypes: INVENTORY_TYPES,
    inventoryFilter,
    setInventoryFilter,
    searchInventory,
    setSearchInventory,
    orders,
    pendingOrders,
    dispatchSearch,
    searchDesp,
    setSearchDesp,
    beds,
    filteredBeds,
    bedsFilter,
    setBedsFilter,
    searchBeds,
    setSearchBeds,
    historyRows,
    searchHistory,
    setSearchHistory,
    ingresos,
    criticalInventory,
    kpis,
    newItemForm,
    setNewItemForm,
    newItemOpen,
    setNewItemOpen,
    handleCreateNewItem,
    ingresoForm,
    setIngresoForm,
    handleLookupIngresoCode,
    handleRegisterIngreso,
    restockTarget,
    restockForm,
    setRestockForm,
    setRestockTargetId,
    handleOpenRestock,
    handleConfirmRestock,
    handleDispatchOrder,
    handleDispatchAll,
    posForm,
    setPosForm,
    posMatches,
    searchPos,
    setSearchPos,
    cart,
    paymentOptions: POS_PAYMENT_OPTIONS,
    handleAddCartItem,
    handleChangeCartQty,
    handleFinalizeSale,
    handleCancelSale,
    handleExportHistoryCsv,
    helpers: {
      formatMoney,
      formatDateTime,
      stockTotal,
      costUnitario: costoUnitario,
      loteMasProximo,
      lotesSummary,
      getStockTone,
    },
    metadata: {
      bodegas: farmaciaSeedBodegas,
      saleReceiptCounter,
      totalSales: sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0),
      totalSalesCount: sales.length,
    },
  };
}
