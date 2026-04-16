import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AREA_CODIGO_MAP,
  AREA_OPTIONS,
  AUTH_LABEL,
  CARGO_UNIDADES,
  CAT_COLOR_CARGO,
  CATEGORIAS_CARGO,
  createInitialPanelAdminData,
  CUENTA_CONTABLE,
  HOTELERIA_CATEGORIAS,
  PANEL_ADMIN_TABS,
  PERFIL_AREA_OPTIONS,
  PERFIL_CARGO_OPTIONS,
  ROLES_DEF,
  TARIFA_CATEGORIAS,
  TARIFA_UNIDADES,
  TIPOS_ANESTESIA,
  USUARIOS_AUTORIZADOS,
} from "../data/panelAdminData";
import {
  buildCsv,
  downloadFile,
  formatClock,
  formatMoney,
  formatNow,
  makeId,
  matchesSearch,
  todayStamp,
} from "../utils/panelAdminUtils";

const DEFAULT_CARGO_FORM = {
  cod: "",
  nom: "",
  cat: CATEGORIAS_CARGO[0],
  desc: "",
  valor: "",
  unidad: CARGO_UNIDADES[0],
  iva: "no",
  auth: "no",
  areas: [],
  notas: "",
};

const DEFAULT_TARIFA_FORM = {
  key: "",
  label: "",
  cat: "CC-HOSP",
  calculo: "fijo",
  unidad: "Por acto",
  valor: "",
  notas: "",
  justif: "",
};

const DEFAULT_HOTELERIA_FORM = {
  cod: "",
  nom: "",
  cat: HOTELERIA_CATEGORIAS[0],
  desc: "",
  precio: "",
  iva: "no",
  disp: "",
  incluye: "",
};

const DEFAULT_PERFIL_FORM = {
  nombre: "",
  cedula: "",
  cargo: PERFIL_CARGO_OPTIONS[0],
  area: PERFIL_AREA_OPTIONS[0],
  user: "",
  pass: "",
  rol: "medico",
  email: "",
};

const DEFAULT_CONVENIO_EDIT_FORM = {
  nombre: "",
  tipo: "A",
  pct: 0,
  iva: "si",
  activo: "si",
};

const DEFAULT_CONVENIO_NEW_FORM = {
  nombre: "",
  tipo: "A",
  pct: 0,
  iva: "si",
};

const calculateDerechoQx = (tarifario, minutosQx) => {
  const tarifa = tarifario.find((item) => item.key === "SVC-010");
  if (!tarifa) {
    return { cargo: 0, descripcion: "Tarifa Qx no configurada" };
  }
  const cargo = tarifa.valor * (minutosQx || 0);
  return {
    cargo: Number(cargo.toFixed(2)),
    descripcion: `Sala Qx: ${formatMoney(tarifa.valor)}/min x ${minutosQx} min = ${formatMoney(cargo)}`,
  };
};

const calculateDerechoAnestesia = (tarifario, tipoAnestesia, minutosQx) => {
  const tipo = String(tipoAnestesia || "").toLowerCase().trim();
  if (tipo === "local" || !tipo) {
    return { cargo: 0, descripcion: "Sin cargo (anestesia local)", key: "SVC-024" };
  }

  const tarifa = tarifario.find((item) => item.tipoAnestesia === tipo);
  if (!tarifa) {
    return { cargo: 0, descripcion: `Tipo de anestesia no reconocido: ${tipo}`, key: null };
  }

  let cargo = 0;
  let descripcion = "";

  switch (tipo) {
    case "general":
      cargo = tarifa.valor * (minutosQx || 0);
      descripcion = `General: ${formatMoney(tarifa.valor)}/min x ${minutosQx} min = ${formatMoney(cargo)}`;
      break;
    case "conductiva":
      cargo = tarifa.valor;
      descripcion = `Conductiva: tarifa fija = ${formatMoney(cargo)}`;
      break;
    case "sedacion": {
      const horas = Math.ceil(((minutosQx || 0) / 60) * 10) / 10;
      cargo = tarifa.valor * horas;
      descripcion = `Sedacion: ${formatMoney(tarifa.valor)}/h x ${horas}h = ${formatMoney(cargo)}`;
      break;
    }
    case "bloqueo":
      cargo = tarifa.valor;
      descripcion = `Bloqueo regional: tarifa fija = ${formatMoney(cargo)}`;
      break;
    default:
      cargo = 0;
      descripcion = "Sin cargo";
      break;
  }

  return {
    cargo: Number(cargo.toFixed(2)),
    descripcion,
    key: tarifa.key,
    tarifa,
  };
};

const createToastState = () => ({
  visible: false,
  message: "",
  tone: "success",
});

const mockErpFetch = (payload) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      const exito = Math.random() > 0.15;
      if (exito) {
        resolve({
          status: 200,
          message: "Lote recibido y procesado",
          erp_lote_ref: `ERP-${Date.now()}`,
          items_ok: payload.items.length,
          items_error: 0,
          timestamp_erp: new Date().toISOString(),
        });
        return;
      }

      resolve({
        status: 422,
        message: "Validacion fallida: convenio_id no reconocido",
        items_ok: 0,
        items_error: payload.items.length,
      });
    }, 800);
  });

const getErpStatusConfig = (status, response) => {
  const cfg = {
    sending: { color: "#3182ce", text: "ERP: Enviando lote...", pulse: true },
    ok: {
      color: "#276749",
      text: `ERP: Sincronizado - ${response?.items_ok || 0} items OK`,
      pulse: false,
    },
    error: {
      color: "#c53030",
      text: `ERP: Error ${response?.status || 0} - ${response?.message || ""}`,
      pulse: false,
    },
    idle: { color: "#b7791f", text: "ERP: En espera de autorizacion", pulse: true },
  };
  return cfg[status] || cfg.idle;
};

export default function usePanelAdministrativo() {
  const [adminData, setAdminData] = useState(() => createInitialPanelAdminData());
  const [session, setSession] = useState(null);
  const [clock, setClock] = useState(formatClock());
  const [activeTab, setActiveTab] = useState("tarifario");
  const [toast, setToast] = useState(createToastState);
  const [openModal, setOpenModal] = useState(null);
  const [tarifaTarget, setTarifaTarget] = useState(null);
  const [cargoTarget, setCargoTarget] = useState(null);
  const [hoteleriaTarget, setHoteleriaTarget] = useState(null);
  const [perfilTarget, setPerfilTarget] = useState(null);
  const [rolTarget, setRolTarget] = useState(null);
  const [convenioTarget, setConvenioTarget] = useState(null);
  const [tarifaForm, setTarifaForm] = useState(DEFAULT_TARIFA_FORM);
  const [cargoForm, setCargoForm] = useState(DEFAULT_CARGO_FORM);
  const [hoteleriaForm, setHoteleriaForm] = useState(DEFAULT_HOTELERIA_FORM);
  const [perfilForm, setPerfilForm] = useState(DEFAULT_PERFIL_FORM);
  const [roleDraft, setRoleDraft] = useState({ rol: "medico", justif: "" });
  const [convenioEditForm, setConvenioEditForm] = useState(DEFAULT_CONVENIO_EDIT_FORM);
  const [convenioNewForm, setConvenioNewForm] = useState(DEFAULT_CONVENIO_NEW_FORM);
  const [cargoFilters, setCargoFilters] = useState({ search: "", category: "", status: "" });
  const [profileSearch, setProfileSearch] = useState("");
  const [logFilters, setLogFilters] = useState({ search: "", type: "" });
  const [simulator, setSimulator] = useState({ servicio: "", convenio: "" });
  const [erpState, setErpState] = useState({
    status: "idle",
    response: null,
    lastSync: "Nunca",
    loteId: "-",
    payload: null,
    visible: false,
  });

  const adminDataRef = useRef(adminData);
  const sessionRef = useRef(session);
  const initializedRef = useRef(false);

  useEffect(() => {
    adminDataRef.current = adminData;
  }, [adminData]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const found = USUARIOS_AUTORIZADOS.gerencia;
    const nextSession = {
      user: "gerencia",
      ...found,
      ts: new Date().toISOString(),
    };
    setSession(nextSession);
    setAdminData((prev) => ({
      ...prev,
      log: [
        ...prev.log,
        {
          fecha: formatNow(),
          usuario: found.nombre,
          rol: found.rol,
          accion: "Acceso automatico al panel",
          antes: "-",
          ahora: found.rol,
          justif: "Ingreso sin credenciales",
          tipo: "acceso",
        },
      ],
    }));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = window.setTimeout(() => setToast(createToastState()), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, tone = "success") => {
    setToast({
      visible: true,
      message,
      tone,
    });
  }, []);

  const createLog = useCallback(
    ({ accion, antes = "-", ahora = "-", justif = "-", tipo = "acceso", extra = {} }) => ({
      fecha: formatNow(),
      usuario: sessionRef.current?.nombre || "Sistema",
      rol: sessionRef.current?.rol || "Sistema",
      accion,
      antes,
      ahora,
      justif,
      tipo,
      ...extra,
    }),
    []
  );

  const kpis = useMemo(() => {
    const pendientes = adminData.cola.filter((item) => item.estado === "PENDIENTE").length;
    const montoPendiente = adminData.cola
      .filter((item) => item.estado === "PENDIENTE")
      .reduce((sum, item) => sum + item.monto, 0);

    return [
      {
        icon: "💲",
        value: adminData.tarifario.length + adminData.hoteleria.length,
        label: "Servicios Totales",
        tone: "navy",
      },
      {
        icon: "👤",
        value: adminData.perfiles.filter((item) => item.activo).length,
        label: "Usuarios Activos",
        tone: "blue",
      },
      {
        icon: "🔄",
        value: pendientes,
        label: "Cargos Pendientes",
        tone: "gold",
      },
      {
        icon: "✅",
        value: formatMoney(montoPendiente),
        label: "En Cola ($)",
        tone: "teal",
      },
      {
        icon: "📜",
        value: adminData.log.length,
        label: "Entradas en Log",
        tone: "red",
      },
    ];
  }, [adminData]);

  const tabCounters = useMemo(
    () => ({
      perfiles: adminData.perfiles.filter((item) => item.activo).length,
      cola: adminData.cola.filter((item) => item.estado === "PENDIENTE").length,
      log: adminData.log.length,
    }),
    [adminData]
  );

  const serviciosTarifario = useMemo(() => {
    const base = adminData.tarifario
      .filter((item) => item.cat !== "Anestesia")
      .map((item) => ({
        ...item,
        _tipo: "base",
        cod: item.key,
      }));

    const cargosExtra = adminData.cargosPersonalizados.map((item) => ({
      ...item,
      key: item.id,
      label: item.nom,
      _tipo: "cargo",
      cod: item.cod,
      valor: item.valor,
      usuario: item.creadoPor,
      ultimoCambio: null,
      anterior: null,
      notas: item.desc || "",
    }));

    return [...base, ...cargosExtra];
  }, [adminData]);

  const cargosFiltrados = useMemo(
    () =>
      adminData.cargosPersonalizados.filter((item) => {
        if (cargoFilters.category && item.cat !== cargoFilters.category) return false;
        if (cargoFilters.status === "activo" && !item.activo) return false;
        if (cargoFilters.status === "inactivo" && item.activo) return false;

        const hayTexto =
          !cargoFilters.search ||
          matchesSearch(
            `${item.nom} ${item.cod} ${item.cat} ${item.desc || ""}`,
            cargoFilters.search
          );

        return hayTexto;
      }),
    [adminData.cargosPersonalizados, cargoFilters]
  );

  const perfilesFiltrados = useMemo(
    () =>
      adminData.perfiles.filter((item) =>
        matchesSearch(
          `${item.user} ${item.nombre} ${item.cargo} ${item.area} ${item.rol}`,
          profileSearch
        )
      ),
    [adminData.perfiles, profileSearch]
  );

  const logsFiltrados = useMemo(() => {
    const query = String(logFilters.search || "").toLowerCase().trim();
    return [...adminData.log]
      .reverse()
      .filter((item) => {
        if (logFilters.type && !String(item.tipo || "").includes(logFilters.type)) return false;
        if (!query) return true;
        return matchesSearch(
          `${item.usuario} ${item.accion} ${item.antes} ${item.ahora} ${item.justif}`,
          query
        );
      });
  }, [adminData.log, logFilters]);

  const rolesPanel = useMemo(
    () =>
      Object.entries(ROLES_DEF).map(([key, role]) => ({
        key,
        ...role,
        count: adminData.perfiles.filter((item) => item.rol === key && item.activo).length,
      })),
    [adminData.perfiles]
  );

  const areasResumen = useMemo(() => {
    const areas = {};
    adminData.perfiles
      .filter((item) => item.activo)
      .forEach((item) => {
        areas[item.area] = (areas[item.area] || 0) + 1;
      });

    return Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .map(([area, total]) => ({ area, total }));
  }, [adminData.perfiles]);

  const cargosPanels = useMemo(() => {
    const activos = adminData.cargosPersonalizados.filter((item) => item.activo);
    const areas = {};
    const categorias = {};
    const authMap = { no: 0, medico: 0, gerencia: 0, seguro: 0 };

    activos.forEach((item) => {
      (item.areas || []).forEach((area) => {
        areas[area] = (areas[area] || 0) + 1;
      });
      categorias[item.cat] = (categorias[item.cat] || 0) + 1;
      authMap[item.auth] = (authMap[item.auth] || 0) + 1;
    });

    return {
      areas: Object.entries(areas)
        .sort((a, b) => b[1] - a[1])
        .map(([area, total]) => ({ area, total })),
      resumen: {
        activos: activos.length,
        inactivos: adminData.cargosPersonalizados.filter((item) => !item.activo).length,
        categorias: Object.entries(categorias).map(([categoria, total]) => ({ categoria, total })),
      },
      autorizacion: Object.entries(authMap).map(([key, total]) => ({
        key,
        total,
        label: AUTH_LABEL[key],
      })),
    };
  }, [adminData.cargosPersonalizados]);

  const cargosKpis = useMemo(() => {
    const total = adminData.cargosPersonalizados.length;
    const activos = adminData.cargosPersonalizados.filter((item) => item.activo).length;
    const hoy = adminData.cargosAplicados.length;
    const recaudado = adminData.cargosAplicados.reduce((sum, item) => sum + item.total, 0);
    const autorizados = adminData.cargosPersonalizados.filter(
      (item) => item.auth !== "no" && item.activo
    ).length;

    return [
      { icon: "📦", value: total, label: "Total Cargos", tone: "navy" },
      { icon: "✅", value: activos, label: "Activos", tone: "teal" },
      { icon: "🔐", value: autorizados, label: "Con Autorizacion", tone: "gold" },
      { icon: "⚡", value: hoy, label: "Aplicados Hoy", tone: "teal" },
      { icon: "💰", value: formatMoney(recaudado), label: "Recaudado Hoy", tone: "green" },
    ];
  }, [adminData.cargosAplicados, adminData.cargosPersonalizados]);

  const simuladorResultado = useMemo(() => {
    if (!simulator.servicio || !simulator.convenio) {
      return { total: "$-", detalle: "", base: 0, iva: 0 };
    }

    const tarifa = adminData.tarifario.find((item) => item.key === simulator.servicio);
    const convenio = adminData.convenios.find((item) => item.id === simulator.convenio);
    if (!tarifa || !convenio) {
      return { total: "$-", detalle: "", base: 0, iva: 0 };
    }

    const ajuste = convenio.pct / 100;
    const base = tarifa.valor;
    const descuento = base * Math.abs(ajuste) * (ajuste < 0 ? -1 : 1);
    const subtotal = base + descuento;
    const iva = convenio.iva === "si" ? subtotal * 0.15 : 0;
    const total = subtotal + iva;

    return {
      total: formatMoney(total),
      detalle: `Base: ${formatMoney(base)} ${
        convenio.pct !== 0 ? `· Ajuste ${convenio.pct}%: ${formatMoney(descuento)}` : ""
      }${iva > 0 ? ` · IVA: ${formatMoney(iva)}` : ""}`,
      base,
      iva,
    };
  }, [adminData.convenios, adminData.tarifario, simulator]);

  const rolePreview = useMemo(() => ROLES_DEF[roleDraft.rol], [roleDraft.rol]);

  const currentErpStatus = useMemo(
    () => getErpStatusConfig(erpState.status, erpState.response),
    [erpState.response, erpState.status]
  );

  const closeModal = useCallback(() => setOpenModal(null), []);

  const handleDoLogout = useCallback(() => {
    const found = USUARIOS_AUTORIZADOS.gerencia;
    const nextSession = {
      user: "gerencia",
      ...found,
      ts: new Date().toISOString(),
    };
    setSession(nextSession);
    setAdminData((prev) => ({
      ...prev,
      log: [
        ...prev.log,
        createLog({
          accion: "Reinicio de sesion",
          justif: "Acceso automatico habilitado",
          tipo: "acceso",
        }),
      ],
    }));
    showToast(`Sesion reiniciada, ${found.nombre}`, "success");
  }, [createLog, showToast]);

  const openTarifaModal = useCallback((item = null) => {
    setTarifaTarget(item?.key || null);
    setTarifaForm(
      item
        ? {
            key: item.key,
            label: item.label,
            cat: item.cat,
            calculo: item.calculo || "fijo",
            unidad: item.unidad || "Por acto",
            valor: item.valor,
            notas: item.notas || "",
            justif: "",
          }
        : DEFAULT_TARIFA_FORM
    );
    setOpenModal("tarifa");
  }, []);

  const openCargoModal = useCallback((item = null) => {
    setCargoTarget(item?.id || null);
    setCargoForm(
      item
        ? {
            cod: item.cod,
            nom: item.nom,
            cat: item.cat,
            desc: item.desc || "",
            valor: item.valor,
            unidad: item.unidad || CARGO_UNIDADES[0],
            iva: item.iva || "no",
            auth: item.auth || "no",
            areas: item.areas || [],
            notas: item.notas || "",
          }
        : DEFAULT_CARGO_FORM
    );
    setOpenModal("cargo");
  }, []);

  const openHoteleriaModal = useCallback((item = null) => {
    setHoteleriaTarget(item?.id || null);
    setHoteleriaForm(
      item
        ? {
            cod: item.cod,
            nom: item.nom,
            cat: item.cat,
            desc: item.desc || "",
            precio: item.precio,
            iva: item.iva || "no",
            disp: item.disp >= 999 ? "" : item.disp,
            incluye: item.incluye || "",
          }
        : DEFAULT_HOTELERIA_FORM
    );
    setOpenModal("hoteleria");
  }, []);

  const openPerfilModal = useCallback((item = null) => {
    setPerfilTarget(item?.id || null);
    setPerfilForm(
      item
        ? {
            nombre: item.nombre,
            cedula: item.cedula || "",
            cargo: item.cargo || PERFIL_CARGO_OPTIONS[0],
            area: item.area || PERFIL_AREA_OPTIONS[0],
            user: item.user,
            pass: "",
            rol: item.rol || "medico",
            email: item.email || "",
          }
        : DEFAULT_PERFIL_FORM
    );
    setOpenModal("perfil");
  }, []);

  const openRoleModal = useCallback((item) => {
    setRolTarget(item?.id || null);
    setRoleDraft({
      rol: item?.rol || "medico",
      justif: "",
    });
    setOpenModal("rol");
  }, []);

  const openConvenioEditModal = useCallback((item) => {
    setConvenioTarget(item?.id || null);
    setConvenioEditForm({
      nombre: item?.nombre || "",
      tipo: item?.tipo || "A",
      pct: item?.pct ?? 0,
      iva: item?.iva || "si",
      activo: item?.activo ? "si" : "no",
    });
    setOpenModal("convenioEdit");
  }, []);

  const openConvenioNewModal = useCallback(() => {
    setConvenioNewForm(DEFAULT_CONVENIO_NEW_FORM);
    setOpenModal("convenioNew");
  }, []);

  const toggleCargoArea = useCallback((area) => {
    setCargoForm((prev) => {
      if (area === "CC-ALL") {
        return {
          ...prev,
          areas: prev.areas.includes("CC-ALL") ? [] : ["CC-ALL"],
        };
      }

      const nextAreas = prev.areas.filter((item) => item !== "CC-ALL");
      if (nextAreas.includes(area)) {
        return { ...prev, areas: nextAreas.filter((item) => item !== area) };
      }
      return { ...prev, areas: [...nextAreas, area] };
    });
  }, []);

  const saveTarifa = useCallback(() => {
    const label = tarifaForm.label.trim();
    const key = tarifaForm.key.trim().replace(/\s+/g, "_");
    const nuevo = Number.parseFloat(tarifaForm.valor) || 0;
    if (!label) {
      showToast("Ingrese el nombre del servicio", "error");
      return;
    }
    if (!tarifaForm.justif.trim()) {
      showToast("La justificacion es obligatoria", "error");
      return;
    }
    if (tarifaForm.calculo !== "local" && nuevo <= 0) {
      showToast("Ingrese un valor mayor a cero", "error");
      return;
    }

    if (tarifaTarget) {
      setAdminData((prev) => {
        const tarifario = prev.tarifario.map((item) => {
          if (item.key !== tarifaTarget) return item;
          return {
            ...item,
            key,
            label,
            cat: tarifaForm.cat,
            calculo: tarifaForm.calculo,
            unidad: tarifaForm.unidad,
            notas: tarifaForm.notas,
            anterior: item.valor,
            valor: nuevo,
            ultimoCambio: formatNow(),
            usuario: sessionRef.current?.nombre || "-",
          };
        });
        return {
          ...prev,
          tarifario,
          log: [
            ...prev.log,
            createLog({
              accion: `Editar servicio "${label}"`,
              antes: formatMoney(
                prev.tarifario.find((item) => item.key === tarifaTarget)?.valor || 0
              ),
              ahora: formatMoney(nuevo),
              justif: tarifaForm.justif.trim(),
              tipo: "tarifa",
            }),
          ],
        };
      });
      showToast(`Servicio actualizado: ${label}`, "success");
    } else {
      if (!key) {
        showToast("Ingrese una clave o codigo", "error");
        return;
      }
      if (adminData.tarifario.some((item) => item.key === key)) {
        showToast(`La clave "${key}" ya existe`, "error");
        return;
      }
      setAdminData((prev) => ({
        ...prev,
        tarifario: [
          ...prev.tarifario,
          {
            key,
            label,
            cat: tarifaForm.cat,
            calculo: tarifaForm.calculo,
            unidad: tarifaForm.unidad,
            valor: nuevo,
            anterior: null,
            ultimoCambio: formatNow(),
            usuario: sessionRef.current?.nombre || "-",
            notas: tarifaForm.notas,
            activo: true,
            _custom: true,
          },
        ],
        log: [
          ...prev.log,
          createLog({
            accion: `Nuevo servicio: ${label}`,
            ahora: formatMoney(nuevo),
            justif: tarifaForm.justif.trim(),
            tipo: "tarifa",
          }),
        ],
      }));
      showToast(`Nuevo servicio creado: ${label}`, "success");
    }

    setTarifaTarget(null);
    closeModal();
  }, [adminData.tarifario, closeModal, createLog, showToast, tarifaForm, tarifaTarget]);

  const saveCargo = useCallback(() => {
    const cod = cargoForm.cod.trim();
    const nom = cargoForm.nom.trim();
    const valor = Number.parseFloat(cargoForm.valor) || 0;
    if (!cod) {
      showToast("Ingrese el codigo", "error");
      return;
    }
    if (!nom) {
      showToast("Ingrese el nombre del cargo", "error");
      return;
    }
    if (valor <= 0) {
      showToast("Ingrese un valor valido", "error");
      return;
    }
    if (!cargoForm.areas.length) {
      showToast("Seleccione al menos un area de aplicacion", "error");
      return;
    }
    if (!cargoTarget && adminData.cargosPersonalizados.some((item) => item.cod === cod)) {
      showToast(`El codigo "${cod}" ya existe`, "error");
      return;
    }

    const cargoPayload = {
      id: cargoTarget || makeId("CG"),
      cod,
      nom,
      cat: cargoForm.cat,
      desc: cargoForm.desc,
      valor,
      unidad: cargoForm.unidad,
      iva: cargoForm.iva,
      auth: cargoForm.auth,
      areas: cargoForm.areas,
      notas: cargoForm.notas,
      activo: true,
      creadoPor: sessionRef.current?.nombre || "Admin",
    };

    setAdminData((prev) => {
      const cargosPersonalizados = cargoTarget
        ? prev.cargosPersonalizados.map((item) =>
            item.id === cargoTarget ? { ...item, ...cargoPayload } : item
          )
        : [...prev.cargosPersonalizados, cargoPayload];

      return {
        ...prev,
        cargosPersonalizados,
        log: [
          ...prev.log,
          createLog({
            accion: `${cargoTarget ? "Editar" : "Nuevo"} cargo: ${nom}`,
            ahora: formatMoney(valor),
            justif: cargoTarget ? "Actualizacion" : "Creacion",
            tipo: "cargo",
          }),
        ],
      };
    });

    showToast(`${cargoTarget ? "Cargo actualizado" : "Cargo creado"}: ${nom}`, "success");
    setCargoTarget(null);
    closeModal();
  }, [adminData.cargosPersonalizados, cargoForm, cargoTarget, closeModal, createLog, showToast]);

  const saveHoteleria = useCallback(() => {
    const nom = hoteleriaForm.nom.trim();
    const precio = Number.parseFloat(hoteleriaForm.precio) || 0;
    if (!nom) {
      showToast("Ingrese el nombre del servicio", "error");
      return;
    }
    if (precio < 0) {
      showToast("El precio no puede ser negativo", "error");
      return;
    }

    const payload = {
      id: hoteleriaTarget || makeId("HOT", 4),
      cod: hoteleriaForm.cod.trim() || makeId("HOT", 3),
      nom,
      cat: hoteleriaForm.cat,
      desc: hoteleriaForm.desc,
      precio,
      iva: hoteleriaForm.iva,
      disp: Number.parseInt(hoteleriaForm.disp, 10) || 999,
      incluye: hoteleriaForm.incluye,
      activo: true,
    };

    setAdminData((prev) => {
      const hoteleria = hoteleriaTarget
        ? prev.hoteleria.map((item) => (item.id === hoteleriaTarget ? payload : item))
        : [...prev.hoteleria, payload];
      return {
        ...prev,
        hoteleria,
        log: [
          ...prev.log,
          createLog({
            accion: `${hoteleriaTarget ? "Editar" : "Nuevo"} servicio hoteleria: ${nom}`,
            ahora: formatMoney(precio),
            justif: hoteleriaTarget ? "Actualizacion" : "Creacion",
            tipo: "tarifa",
          }),
        ],
      };
    });

    showToast(`Servicio guardado: ${nom}`, "success");
    setHoteleriaTarget(null);
    closeModal();
  }, [closeModal, createLog, hoteleriaForm, hoteleriaTarget, showToast]);

  const savePerfil = useCallback(() => {
    const nombre = perfilForm.nombre.trim();
    const user = perfilForm.user.trim();
    if (!nombre || !user) {
      showToast("Nombre y usuario son obligatorios", "error");
      return;
    }
    if (adminData.perfiles.some((item) => item.user === user && item.id !== perfilTarget)) {
      showToast(`El usuario "${user}" ya existe`, "error");
      return;
    }

    const payload = {
      id: perfilTarget || makeId("USR", 4),
      nombre,
      cedula: perfilForm.cedula,
      cargo: perfilForm.cargo,
      area: perfilForm.area,
      user,
      rol: perfilForm.rol,
      email: perfilForm.email,
      activo: true,
      ultimoAcceso: perfilTarget
        ? adminData.perfiles.find((item) => item.id === perfilTarget)?.ultimoAcceso || "-"
        : "-",
    };

    setAdminData((prev) => {
      const perfiles = perfilTarget
        ? prev.perfiles.map((item) => (item.id === perfilTarget ? { ...item, ...payload } : item))
        : [...prev.perfiles, payload];
      return {
        ...prev,
        perfiles,
        log: [
          ...prev.log,
          createLog({
            accion: `${perfilTarget ? "Editar perfil" : "Nuevo usuario"}: ${nombre}`,
            ahora: ROLES_DEF[payload.rol]?.label || payload.rol,
            justif: perfilTarget ? "Actualizacion de perfil" : "Creacion de perfil",
            tipo: "acceso",
          }),
        ],
      };
    });

    showToast(`Perfil guardado: ${nombre}`, "success");
    setPerfilTarget(null);
    closeModal();
  }, [adminData.perfiles, closeModal, createLog, perfilForm, perfilTarget, showToast]);

  const saveRoleChange = useCallback(() => {
    const justif = roleDraft.justif.trim();
    if (!justif) {
      showToast("La justificacion es obligatoria", "error");
      return;
    }
    const perfil = adminData.perfiles.find((item) => item.id === rolTarget);
    if (!perfil) return;
    if (perfil.rol === roleDraft.rol) {
      showToast("El usuario ya tiene ese rol asignado", "warning");
      return;
    }

    const anterior = ROLES_DEF[perfil.rol]?.label || perfil.rol;
    const nuevo = ROLES_DEF[roleDraft.rol]?.label || roleDraft.rol;

    setAdminData((prev) => ({
      ...prev,
      perfiles: prev.perfiles.map((item) =>
        item.id === rolTarget ? { ...item, rol: roleDraft.rol } : item
      ),
      log: [
        ...prev.log,
        createLog({
          accion: `Cambio de rol: ${perfil.nombre}`,
          antes: anterior,
          ahora: nuevo,
          justif,
          tipo: "acceso",
        }),
      ],
    }));

    showToast(`Rol actualizado: ${perfil.nombre} -> ${nuevo}`, "success");
    setRolTarget(null);
    closeModal();
  }, [adminData.perfiles, closeModal, createLog, roleDraft, rolTarget, showToast]);

  const saveConvenioEdit = useCallback(() => {
    const target = adminData.convenios.find((item) => item.id === convenioTarget);
    if (!target) return;

    const anterior = { ...target };
    setAdminData((prev) => ({
      ...prev,
      convenios: prev.convenios.map((item) =>
        item.id === convenioTarget
          ? {
              ...item,
              nombre: convenioEditForm.nombre.trim() || item.nombre,
              tipo: convenioEditForm.tipo,
              pct: Number.parseFloat(convenioEditForm.pct) || 0,
              iva: convenioEditForm.iva,
              activo: convenioEditForm.activo === "si",
            }
          : item
      ),
      log: [
        ...prev.log,
        createLog({
          accion: `Cambio convenio "${convenioEditForm.nombre.trim() || target.nombre}"`,
          antes: `${anterior.pct}% / Tipo ${anterior.tipo}`,
          ahora: `${Number.parseFloat(convenioEditForm.pct) || 0}% / Tipo ${convenioEditForm.tipo}`,
          justif: "Actualizacion convenio",
          tipo: "convenio",
        }),
      ],
    }));

    showToast(`Convenio actualizado: ${convenioEditForm.nombre || target.nombre}`, "success");
    setConvenioTarget(null);
    closeModal();
  }, [
    adminData.convenios,
    closeModal,
    convenioEditForm,
    convenioTarget,
    createLog,
    showToast,
  ]);

  const saveConvenioNew = useCallback(() => {
    const nombre = convenioNewForm.nombre.trim();
    if (!nombre) {
      showToast("Ingrese el nombre del convenio", "error");
      return;
    }

    setAdminData((prev) => ({
      ...prev,
      convenios: [
        ...prev.convenios,
        {
          id: makeId("CONV", 6),
          nombre,
          tipo: convenioNewForm.tipo,
          pct: Number.parseFloat(convenioNewForm.pct) || 0,
          iva: convenioNewForm.iva,
          activo: true,
        },
      ],
      log: [
        ...prev.log,
        createLog({
          accion: `Nuevo convenio: ${nombre}`,
          ahora: "ACTIVO",
          justif: "Creacion",
          tipo: "convenio",
        }),
      ],
    }));

    showToast(`Convenio creado: ${nombre}`, "success");
    closeModal();
  }, [closeModal, convenioNewForm, createLog, showToast]);

  const toggleHoteleria = useCallback(
    (id) => {
      const servicio = adminData.hoteleria.find((item) => item.id === id);
      if (!servicio) return;
      setAdminData((prev) => ({
        ...prev,
        hoteleria: prev.hoteleria.map((item) =>
          item.id === id ? { ...item, activo: !item.activo } : item
        ),
        log: [
          ...prev.log,
          createLog({
            accion: `${servicio.activo ? "Desactivar" : "Activar"} servicio: ${servicio.nom}`,
            antes: servicio.activo ? "Activo" : "Inactivo",
            ahora: servicio.activo ? "Inactivo" : "Activo",
            justif: "Cambio de estado",
            tipo: "tarifa",
          }),
        ],
      }));
      showToast(
        `${servicio.activo ? "Servicio desactivado" : "Servicio activado"}: ${servicio.nom}`,
        "success"
      );
    },
    [adminData.hoteleria, createLog, showToast]
  );

  const togglePerfil = useCallback(
    (id) => {
      const perfil = adminData.perfiles.find((item) => item.id === id);
      if (!perfil) return;
      if (!window.confirm(`${perfil.activo ? "Desactivar" : "Activar"} al usuario ${perfil.nombre}?`)) {
        return;
      }
      setAdminData((prev) => ({
        ...prev,
        perfiles: prev.perfiles.map((item) =>
          item.id === id ? { ...item, activo: !item.activo } : item
        ),
        log: [
          ...prev.log,
          createLog({
            accion: `${perfil.activo ? "Desactivar" : "Activar"} usuario: ${perfil.nombre}`,
            antes: perfil.activo ? "Activo" : "Inactivo",
            ahora: perfil.activo ? "Inactivo" : "Activo",
            justif: "Cambio de estado manual",
            tipo: "acceso",
          }),
        ],
      }));
      showToast(
        `${perfil.activo ? "Usuario desactivado" : "Usuario activado"}: ${perfil.nombre}`,
        "success"
      );
    },
    [adminData.perfiles, createLog, showToast]
  );

  const toggleCargo = useCallback(
    (id) => {
      const cargo = adminData.cargosPersonalizados.find((item) => item.id === id);
      if (!cargo) return;
      setAdminData((prev) => ({
        ...prev,
        cargosPersonalizados: prev.cargosPersonalizados.map((item) =>
          item.id === id ? { ...item, activo: !item.activo } : item
        ),
        log: [
          ...prev.log,
          createLog({
            accion: `${cargo.activo ? "Desactivar" : "Activar"} cargo: ${cargo.nom}`,
            antes: cargo.activo ? "Activo" : "Inactivo",
            ahora: cargo.activo ? "Inactivo" : "Activo",
            justif: "Cambio de estado",
            tipo: "cargo",
          }),
        ],
      }));
      showToast(`${cargo.activo ? "Cargo desactivado" : "Cargo activado"}: ${cargo.nom}`, "success");
    },
    [adminData.cargosPersonalizados, createLog, showToast]
  );

  const toggleServicio = useCallback(
    (key, tipo) => {
      if (tipo === "base") {
        const target = adminData.tarifario.find((item) => item.key === key);
        if (!target) return;
        setAdminData((prev) => ({
          ...prev,
          tarifario: prev.tarifario.map((item) =>
            item.key === key ? { ...item, activo: item.activo === false ? true : false } : item
          ),
          log: [
            ...prev.log,
            createLog({
              accion: `${target.activo === false ? "Activar" : "Desactivar"} servicio: ${target.label}`,
              antes: target.activo === false ? "Inactivo" : "Activo",
              ahora: target.activo === false ? "Activo" : "Inactivo",
              justif: "Cambio de estado",
              tipo: "tarifa",
            }),
          ],
        }));
        showToast(
          `${target.activo === false ? "Servicio activado" : "Servicio desactivado"}: ${target.label}`,
          target.activo === false ? "success" : "warning"
        );
        return;
      }
      toggleCargo(key);
    },
    [adminData.tarifario, createLog, showToast, toggleCargo]
  );

  const eliminarServicio = useCallback(
    (key, tipo) => {
      const target =
        tipo === "base"
          ? adminData.tarifario.find((item) => item.key === key)
          : adminData.cargosPersonalizados.find((item) => item.id === key);

      if (!target) return;
      const label = tipo === "base" ? target.label : target.nom;

      if (
        !window.confirm(
          `Eliminar "${label}"?\n\nSi ya no se usa pero podria volver, considere desactivarlo en lugar de eliminarlo.`
        )
      ) {
        return;
      }

      const justif = window.prompt("Motivo de la eliminacion (requerido para auditoria):");
      if (justif === null) return;
      if (!justif.trim()) {
        showToast("Debe ingresar el motivo para continuar", "error");
        return;
      }

      setAdminData((prev) => ({
        ...prev,
        tarifario:
          tipo === "base" ? prev.tarifario.filter((item) => item.key !== key) : prev.tarifario,
        cargosPersonalizados:
          tipo === "cargo"
            ? prev.cargosPersonalizados.filter((item) => item.id !== key)
            : prev.cargosPersonalizados,
        log: [
          ...prev.log,
          createLog({
            accion: `Eliminar: ${label}`,
            antes: "Activo",
            ahora: "ELIMINADO",
            justif: justif.trim(),
            tipo: "tarifa",
          }),
        ],
      }));

      showToast(`Eliminado: ${label}`, "error");
    },
    [adminData.cargosPersonalizados, adminData.tarifario, createLog, showToast]
  );

  const resolveSku = useCallback((itemName) => {
    const norm = String(itemName || "").toLowerCase();
    const tariff = adminDataRef.current.tarifario.find(
      (item) => item.label.toLowerCase() === norm || item.key.toLowerCase() === norm
    );
    if (tariff) return tariff.key.toUpperCase();

    const cargo = adminDataRef.current.cargosPersonalizados.find(
      (item) => item.nom.toLowerCase() === norm || item.cod.toLowerCase() === norm
    );
    if (cargo) return cargo.cod;

    return norm.replace(/[^a-z0-9]/g, "_").slice(0, 20).toUpperCase() || "GEN_ITEM";
  }, []);

  const resolverConvenioId = useCallback((cargo) => cargo?.convenio_id || "CONV-001", []);

  const exportarLoteFacturacion = useCallback(
    (download = true) => {
      const pendientes = adminDataRef.current.cola.filter(
        (item) => item.estado === "PENDIENTE" && !item.isLocked
      );
      if (!pendientes.length) {
        showToast("Sin cargos pendientes para generar lote", "warning");
        return null;
      }

      const loteId = `LOTE-${Date.now()}`;
      const ts = new Date().toISOString();

      const payload = {
        meta: {
          transaccion_id: `${loteId}_${ts}`,
          lote_id: loteId,
          timestamp_utc: ts,
          emisor: "Medix8 HIS v4",
          receptor: "ERP Externo",
          total_items: pendientes.length,
          monto_total: Number(
            pendientes.reduce((sum, item) => sum + item.monto, 0).toFixed(2)
          ),
          generado_por: sessionRef.current?.nombre || "SISTEMA",
          rol: sessionRef.current?.rol || "SISTEMA",
        },
        items: pendientes.map((cargo, index) => {
          const areaCodigo =
            AREA_CODIGO_MAP[cargo.area] || AREA_CODIGO_MAP[cargo.modulo] || "GEN";
          const sku = resolveSku(cargo.concepto || cargo.item || "");
          const catFind =
            adminDataRef.current.tarifario.find((item) => item.key === sku) ||
            adminDataRef.current.cargosPersonalizados.find((item) => item.cod === sku);
          const cat = catFind?.cat || "default";
          return {
            linea_id: index + 1,
            transaccion_id: `${loteId}_${ts}`,
            paciente_hcl: cargo.paciente || "CF",
            convenio_id: resolverConvenioId(cargo),
            item_sku: sku,
            item_descripcion: cargo.concepto || cargo.item || "-",
            cantidad_neta: 1,
            precio_unitario: cargo.monto,
            monto_total: cargo.monto,
            area_codigo: areaCodigo,
            modulo_origen: cargo.modulo || "-",
            lote_farmacia: cargo.lote || "-",
            fecha_evento: cargo.fecha || ts,
            cuenta_contable: CUENTA_CONTABLE[cat] || CUENTA_CONTABLE.default,
          };
        }),
      };

      setErpState((prev) => ({
        ...prev,
        payload,
        loteId,
        visible: true,
      }));

      if (download) {
        downloadFile(JSON.stringify(payload, null, 2), `${loteId}.json`, "application/json");
        showToast(`Lote ${loteId} generado - ${pendientes.length} items`, "success");
      }

      return payload;
    },
    [resolveSku, resolverConvenioId, showToast]
  );

  const verificarBloqueo = useCallback(
    (cargo) => {
      if (cargo?.isLocked) {
        showToast("Cargo bloqueado - ya fue sincronizado con el ERP", "error");
        return true;
      }
      return false;
    },
    [showToast]
  );

  const sincronizarTodo = useCallback(() => {
    if (!sessionRef.current?.permisos.includes("sync")) {
      showToast("Sin permisos de sincronizacion", "error");
      return;
    }
    const pendientes = adminData.cola.filter((item) => item.estado === "PENDIENTE");
    if (!pendientes.length) {
      showToast("No hay cargos pendientes", "warning");
      return;
    }
    const lastSync = formatNow();
    const total = pendientes.reduce((sum, item) => sum + item.monto, 0);

    setAdminData((prev) => ({
      ...prev,
      cola: prev.cola.map((item) =>
        item.estado === "PENDIENTE" ? { ...item, estado: "SINCRONIZADO" } : item
      ),
      log: [
        ...prev.log,
        createLog({
          accion: `Cierre de lote - ${pendientes.length} cargos por ${formatMoney(total)}`,
          antes: "PENDIENTE",
          ahora: "SINCRONIZADO",
          justif: "Autorizacion manual cierre de lote",
          tipo: "sync",
        }),
      ],
    }));

    setErpState((prev) => ({
      ...prev,
      lastSync,
    }));

    showToast(`${pendientes.length} cargos sincronizados - ${formatMoney(total)}`, "success");
  }, [adminData.cola, createLog, showToast]);

  const enviarERP = useCallback(async () => {
    if (!sessionRef.current?.permisos.includes("sync")) {
      showToast("Sin permisos de sincronizacion con ERP", "error");
      return;
    }

    const payload = exportarLoteFacturacion(false);
    if (!payload) return;

    setErpState((prev) => ({
      ...prev,
      status: "sending",
      response: null,
      visible: true,
    }));
    showToast("Enviando lote al ERP...", "warning");

    try {
      const respuesta = await mockErpFetch(payload);
      if (respuesta.status === 200) {
        const syncTs = formatNow();
        const pendientes = adminDataRef.current.cola.filter(
          (item) => item.estado === "PENDIENTE" && !item.isLocked
        );
        const total = pendientes.reduce((sum, item) => sum + item.monto, 0);
        setAdminData((prev) => ({
          ...prev,
          cola: prev.cola.map((item) =>
            item.estado === "PENDIENTE" && !item.isLocked
              ? {
                  ...item,
                  estado: "SINCRONIZADO",
                  isLocked: true,
                  lockedAt: new Date().toISOString(),
                  lockedBy: sessionRef.current?.nombre || "SISTEMA",
                }
              : item
          ),
          log: [
            ...prev.log,
            createLog({
              accion: `ERP SYNC OK - Lote ${payload.meta.lote_id} · ${pendientes.length} items · ${formatMoney(total)}`,
              antes: "PENDIENTE",
              ahora: "SINCRONIZADO+BLOQUEADO",
              justif: `Respuesta ERP 200 OK · txn_id: ${payload.meta.transaccion_id}`,
              tipo: "sync",
              extra: { isLocked: true, erp_response: respuesta },
            }),
          ],
        }));
        setErpState((prev) => ({
          ...prev,
          status: "ok",
          response: respuesta,
          lastSync: syncTs,
          visible: true,
        }));
        showToast(
          `ERP sincronizado - ${pendientes.length} cargos bloqueados · ${formatMoney(total)}`,
          "success"
        );
        return;
      }

      setAdminData((prev) => ({
        ...prev,
        log: [
          ...prev.log,
          createLog({
            accion: `ERP SYNC FALLO - Lote ${payload.meta.lote_id}`,
            antes: "PENDIENTE",
            ahora: "ERROR_ERP",
            justif: `HTTP ${respuesta.status}: ${respuesta.message || "Error desconocido"}`,
            tipo: "sync",
          }),
        ],
      }));
      setErpState((prev) => ({
        ...prev,
        status: "error",
        response: respuesta,
      }));
      showToast(`ERP rechazo el lote: ${respuesta.message}`, "error");
    } catch (error) {
      setErpState((prev) => ({
        ...prev,
        status: "error",
        response: { status: 0, message: error.message },
      }));
      showToast(`Error de red: ${error.message}`, "error");
    }
  }, [createLog, exportarLoteFacturacion, showToast]);

  const calcularCargosQx = useCallback((tipoAnestesia, horaInicio, horaFin) => {
    const [hI, mI] = String(horaInicio || "00:00").split(":").map(Number);
    const [hF, mF] = String(horaFin || "00:00").split(":").map(Number);
    const minutos = Math.max(0, hF * 60 + mF - (hI * 60 + mI));
    const qx = calculateDerechoQx(adminDataRef.current.tarifario, minutos);
    const anest = calculateDerechoAnestesia(adminDataRef.current.tarifario, tipoAnestesia, minutos);
    return {
      tipoAnestesia,
      minutosQx: minutos,
      derechoQx: qx.cargo,
      derechoAnestesia: anest.cargo,
      totalActoQx: Number((qx.cargo + anest.cargo).toFixed(2)),
      descripcionQx: qx.descripcion,
      descripcionAnest: anest.descripcion,
    };
  }, []);

  useEffect(() => {
    window.Medix8ERP = {
      exportarLote: exportarLoteFacturacion,
      enviar: enviarERP,
      verificarLock: verificarBloqueo,
      calcularCargosQx,
    };

    return () => {
      delete window.Medix8ERP;
    };
  }, [calcularCargosQx, enviarERP, exportarLoteFacturacion, verificarBloqueo]);

  const exportTarifario = useCallback(() => {
    const csv = buildCsv(
      ["Clave", "Servicio", "Categoria", "Tarifa Actual", "Tarifa Anterior", "Ultimo Cambio", "Usuario"],
      adminData.tarifario.map((item) =>
        [
          `"${item.key}"`,
          `"${item.label}"`,
          `"${item.cat}"`,
          item.valor.toFixed(2),
          item.anterior != null ? item.anterior.toFixed(2) : "",
          `"${item.ultimoCambio || ""}"`,
          `"${item.usuario || ""}"`,
        ].join(",")
      )
    );
    downloadFile(csv, `Tarifario_Medix8_${todayStamp()}.csv`, "text/csv;charset=utf-8;");
    showToast("Tarifario exportado", "success");
  }, [adminData.tarifario, showToast]);

  const exportCargos = useCallback(() => {
    const csv = buildCsv(
      [
        "Codigo",
        "Nombre",
        "Categoria",
        "Descripcion",
        "Valor",
        "Unidad",
        "IVA",
        "Autorizacion",
        "Aplica a",
        "Estado",
        "Creado por",
      ],
      adminData.cargosPersonalizados.map((item) =>
        [
          `"${item.cod}"`,
          `"${item.nom}"`,
          `"${item.cat}"`,
          `"${item.desc || ""}"`,
          item.valor.toFixed(2),
          `"${item.unidad}"`,
          `"${item.iva === "si" ? "Con IVA" : "Exento"}"`,
          `"${AUTH_LABEL[item.auth] || item.auth}"`,
          `"${(item.areas || []).join(" | ")}"`,
          `"${item.activo ? "Activo" : "Inactivo"}"`,
          `"${item.creadoPor || ""}"`,
        ].join(",")
      )
    );
    downloadFile(csv, `Cargos_Personalizados_${todayStamp()}.csv`, "text/csv;charset=utf-8;");
    showToast("Cargos exportados", "success");
  }, [adminData.cargosPersonalizados, showToast]);

  const exportHoteleria = useCallback(() => {
    const csv = buildCsv(
      [
        "Codigo",
        "Servicio",
        "Categoria",
        "Descripcion",
        "Tarifa/dia",
        "IVA",
        "Disponibilidad",
        "Estado",
        "Incluye",
      ],
      adminData.hoteleria.map((item) =>
        [
          `"${item.cod}"`,
          `"${item.nom}"`,
          `"${item.cat}"`,
          `"${item.desc}"`,
          item.precio.toFixed(2),
          `"${item.iva === "si" ? "Con IVA" : "Exento"}"`,
          item.disp >= 999 ? "Ilimitado" : item.disp,
          `"${item.activo ? "Activo" : "Inactivo"}"`,
          `"${item.incluye || ""}"`,
        ].join(",")
      )
    );
    downloadFile(csv, `Hoteleria_${todayStamp()}.csv`, "text/csv;charset=utf-8;");
    showToast("Hoteleria exportada", "success");
  }, [adminData.hoteleria, showToast]);

  const exportCola = useCallback(() => {
    const csv = buildCsv(
      ["Fecha/Hora", "Modulo", "Concepto", "Paciente", "Area", "Monto", "Lote", "Estado"],
      adminData.cola.map((item) =>
        [
          `"${item.fecha}"`,
          `"${item.modulo}"`,
          `"${item.concepto}"`,
          `"${item.paciente}"`,
          `"${item.area}"`,
          item.monto.toFixed(2),
          `"${item.lote || ""}"`,
          `"${item.estado}"`,
        ].join(",")
      )
    );
    downloadFile(csv, `Cola_Cargos_${todayStamp()}.csv`, "text/csv;charset=utf-8;");
    showToast("Cola exportada", "success");
  }, [adminData.cola, showToast]);

  const exportLog = useCallback(() => {
    const csv = buildCsv(
      ["Fecha/Hora", "Usuario", "Rol", "Accion", "Valor Anterior", "Valor Nuevo", "Justificacion", "Tipo"],
      adminData.log.map((item) =>
        [
          `"${item.fecha}"`,
          `"${item.usuario || ""}"`,
          `"${item.rol || ""}"`,
          `"${item.accion}"`,
          `"${item.antes || ""}"`,
          `"${item.ahora || ""}"`,
          `"${item.justif || ""}"`,
          `"${item.tipo || ""}"`,
        ].join(",")
      )
    );
    downloadFile(csv, `Log_Auditoria_Admin_${todayStamp()}.csv`, "text/csv;charset=utf-8;");
    showToast("Log de auditoria exportado", "success");
  }, [adminData.log, showToast]);

  return {
    tabs: PANEL_ADMIN_TABS,
    activeTab,
    setActiveTab,
    tabCounters,
    clock,
    session,
    toast,
    openModal,
    closeModal,
    showToast,
    kpis,
    serviciosTarifario,
    cargosFiltrados,
    cargosKpis,
    cargosPanels,
    perfilesFiltrados,
    rolesPanel,
    areasResumen,
    convenios: adminData.convenios,
    hoteleria: adminData.hoteleria,
    cola: adminData.cola,
    logsFiltrados,
    adminData,
    simulator,
    setSimulator,
    simuladorResultado,
    cargoFilters,
    setCargoFilters,
    profileSearch,
    setProfileSearch,
    logFilters,
    setLogFilters,
    tarifaForm,
    setTarifaForm,
    cargoForm,
    setCargoForm,
    hoteleriaForm,
    setHoteleriaForm,
    perfilForm,
    setPerfilForm,
    roleDraft,
    setRoleDraft,
    convenioEditForm,
    setConvenioEditForm,
    convenioNewForm,
    setConvenioNewForm,
    tarifaTarget,
    cargoTarget,
    hoteleriaTarget,
    perfilTarget,
    rolTarget,
    convenioTarget,
    rolePreview,
    currentErpStatus,
    erpState,
    toggleCargoArea,
    openTarifaModal,
    openCargoModal,
    openHoteleriaModal,
    openPerfilModal,
    openRoleModal,
    openConvenioEditModal,
    openConvenioNewModal,
    saveTarifa,
    saveCargo,
    saveHoteleria,
    savePerfil,
    saveRoleChange,
    saveConvenioEdit,
    saveConvenioNew,
    toggleHoteleria,
    togglePerfil,
    toggleCargo,
    toggleServicio,
    eliminarServicio,
    exportTarifario,
    exportCargos,
    exportHoteleria,
    exportCola,
    exportLog,
    exportarLoteFacturacion,
    enviarERP,
    sincronizarTodo,
    handleDoLogout,
    calculateDerechoQx: (minutos) => calculateDerechoQx(adminData.tarifario, minutos),
    calculateDerechoAnestesia: (tipo, minutos) =>
      calculateDerechoAnestesia(adminData.tarifario, tipo, minutos),
    calcularCargosQx,
    constants: {
      areaOptions: AREA_OPTIONS,
      cargoCategories: CATEGORIAS_CARGO,
      cargoUnits: CARGO_UNIDADES,
      perfilAreas: PERFIL_AREA_OPTIONS,
      perfilCargos: PERFIL_CARGO_OPTIONS,
      tarifaCategories: TARIFA_CATEGORIAS,
      tarifaUnits: TARIFA_UNIDADES,
      roles: ROLES_DEF,
      authLabels: AUTH_LABEL,
      cargoColors: CAT_COLOR_CARGO,
      tiposAnestesia: TIPOS_ANESTESIA,
    },
  };
}
