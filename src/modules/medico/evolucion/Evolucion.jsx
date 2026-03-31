import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SoabieForm from "./components/SoabieForm";
import DiagnosticoCIE10 from "./components/DiagnosticoCIE10";
import InfusionesTable from "./components/InfusionesTable";
import PrescripcionMedica from "./components/PrescripcionMedica";
import FarmaciaPanel from "./components/FarmaciaPanel";
import MedicionHabitual from "./components/MedicionHabitual";
import ExamenesComplementarios from "./components/ExamenesComplementarios";
import FirmaMedica from "./components/FirmaMedica";
import BottomBar from "./components/BottomBar";
import SignosVitales from "./components/SignosVitales";
import usePrescripciones from "./hook/usePrescripciones";
import {
  createClinicalEvolutionWithDetails,
  getAdmisionForModuleById,
  getClinicalEvolutionFull,
  getLatestSignosVitalesByAdmisionId,
  insertSignosVitalesByAdmisionId,
} from "../../../services/admisionesSupabaseService";
import "./styles/evolucion.css";

const INITIAL_SIGNOS = {
  pa: "",
  fc: "",
  fr: "",
  temp: "",
  spo2: "",
  glucosa: "",
  peso: "",
  diuresis: "",
  actividadMovilizacion: "",
  dietaIndicada: "",
};

const INITIAL_FORM_DATA = {
  subjetivo: "",
  objetivo: "",
  analisis: "",
  bienestar: "",
  intervenciones: "",
  evaluacion: "",
  enfermeria: "",
  observaciones: "",
  examenesSolicitados: "",
  examenesResultados: "",
  medico: "",
  codigo: "",
  fecha: "",
};

const INITIAL_SIGNATURE = {
  firmado: false,
  hash: "",
  ts: "",
  serie: "",
};

const INITIAL_MEDICACION_HABITUAL = {
  rows: [],
  alergias: "",
  observaciones: "",
};

const SECTION_SEPARATOR = "\n\n---\n\n";

const toStringSafe = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatDateTime = (isoValue) => {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNowDateTimeLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const isMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    return Object.values(value).some((item) => isMeaningfulValue(item));
  }
  return true;
};

const buildSectionDocument = (sections = []) =>
  sections
    .map(([title, value]) => [title, toStringSafe(value).trim()])
    .filter(([, value]) => value.length > 0)
    .map(([title, value]) => `${title}:\n${value}`)
    .join(SECTION_SEPARATOR);

const parseSectionDocument = (text) => {
  const output = {};
  const source = toStringSafe(text).trim();
  if (!source) return output;

  source
    .split(SECTION_SEPARATOR)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .forEach((chunk) => {
      const match = chunk.match(/^([A-Z0-9_ /-]+):\n([\s\S]*)$/);
      if (!match) return;
      output[match[1].trim()] = match[2].trim();
    });

  return output;
};

const buildSoabieNarrative = (formData) =>
  buildSectionDocument([
    ["SUBJETIVO", formData.subjetivo],
    ["OBJETIVO", formData.objetivo],
    ["BIENESTAR", formData.bienestar],
    ["INTERVENCIONES", formData.intervenciones],
    ["EVALUACION_PLAN", formData.evaluacion],
  ]);

const buildDiagnosticoSummary = (rows = []) =>
  rows
    .filter((row) => row.code?.trim() || row.desc?.trim())
    .map((row) =>
      [row.tipo, row.code, row.desc, row.estado, row.obs]
        .filter((value) => toStringSafe(value).trim().length > 0)
        .join(" | ")
    )
    .join("\n");

const buildMedicacionHabitualSummary = (value = INITIAL_MEDICACION_HABITUAL) =>
  (value.rows || [])
    .filter((row) =>
      [row.medicamento, row.dosis, row.frecuencia, row.via, row.indicacion, row.obs].some(
        (item) => toStringSafe(item).trim().length > 0
      )
    )
    .map((row) =>
      [
        row.medicamento,
        row.comercial ? `(${row.comercial})` : "",
        row.dosis,
        row.frecuencia,
        row.via,
        row.indicacion,
        row.continuar ? `Plan: ${row.continuar}` : "",
        row.obs,
      ]
        .filter((item) => toStringSafe(item).trim().length > 0)
        .join(" | ")
    )
    .join("\n");

const buildSignatureSummary = (formData, signature) => {
  if (!signature?.firmado) return "";
  return [
    `Médico: ${formData.medico || "Sin nombre"}`,
    `Código: ${formData.codigo || "Sin matrícula"}`,
    `Serie: ${signature.serie || "ATLAS-FE"}`,
    `Hash: ${signature.hash || "Sin hash"}`,
    `Registro: ${signature.ts || "Sin marca de tiempo"}`,
  ].join("\n");
};

const buildObservacionesNarrative = (formData, diagnosticos, medicacionHabitual, signature) =>
  buildSectionDocument([
    ["OBSERVACIONES_GENERALES", formData.observaciones],
    ["EXAMENES_RESULTADOS", formData.examenesResultados],
    ["DIAGNOSTICOS_CIE10", buildDiagnosticoSummary(diagnosticos)],
    ["MEDICACION_HABITUAL", buildMedicacionHabitualSummary(medicacionHabitual)],
    ["ALERGIAS_MEDICAMENTOSAS", medicacionHabitual.alergias],
    ["ADHERENCIA_Y_OBSERVACIONES", medicacionHabitual.observaciones],
    ["FIRMA_DIGITAL", buildSignatureSummary(formData, signature)],
  ]);

const extractHoursFromFrequency = (frequency) => {
  const match = toStringSafe(frequency)
    .toLowerCase()
    .match(/c\/\s*(\d+)\s*h/);
  return match ? Number.parseInt(match[1], 10) : null;
};

const mapRxToMedicationRow = (rx) => ({
  medicamento: rx.nom || "",
  via: rx.via || "",
  frecuencia: rx.frec || "",
  horaPrimeraToma: (rx.dosisLog || []).find((item) => item.tipo === "admin")?.hora || "",
  intervaloHoras: extractHoursFromFrequency(rx.frec),
  presentacion: rx.conc || "",
  administra: rx.dosis || "",
  cantidad: rx.farmUnidades || rx.cant || "",
  indicacion: [
    rx.obsCustom,
    rx.com ? `Comercial: ${rx.com}` : "",
    rx.urgente ? "URGENTE" : "",
    rx.status ? `Estado: ${rx.status}` : "",
  ]
    .filter(Boolean)
    .join(" | "),
});

const mapMedicationRowToRx = (row, index) => ({
  id: index + 1,
  nom: row.medicamento || "",
  com: "",
  conc: row.presentacion || "",
  dosis: row.administra || "",
  via: row.via || "",
  frec: row.frecuencia || "",
  dur: "",
  status: "pendiente",
  urgente: false,
  solicitudFarmacia: false,
  cant: row.cantidad || "",
  farmUnidades: row.cantidad || null,
  obsCustom: row.indicacion || "",
});

const mapInfusionRowToSupabase = (row) => ({
  tipo: [row.solucion, row.volumen].filter(Boolean).join(" "),
  indicacion: [row.aditivos, row.via, row.estado].filter(Boolean).join(" | "),
  frecuencia: [row.velocidad, row.duracion, row.inicio].filter(Boolean).join(" | "),
});

const createSignatureState = (formData) => {
  const now = new Date();
  const fingerprint = `${formData.medico || ""}|${formData.codigo || ""}|${now.getTime()}`;
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i += 1) {
    hash = (hash << 5) - hash + fingerprint.charCodeAt(i);
    hash |= 0;
  }

  const compact = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");

  return {
    firmado: true,
    hash: `SHA256:${compact}-${now.getTime().toString(36).toUpperCase()}`,
    ts: `Firmado digitalmente el ${now.toLocaleString("es-EC")}`,
    serie: `ATLAS-FE-${String(now.getFullYear()).slice(-2)}`,
  };
};

const buildEvolutionPayload = ({
  admisionId,
  formData,
  signosVitales,
  rxList,
  infusiones,
  diagnosticos,
  medicacionHabitual,
  signature,
}) => ({
  admision_id: admisionId,
  evolucion: buildSoabieNarrative(formData),
  analisis: formData.analisis || null,
  enfermeria: formData.enfermeria || null,
  actividades:
    [formData.intervenciones, signosVitales.actividadMovilizacion].filter(Boolean).join(" | ") ||
    null,
  observaciones: buildObservacionesNarrative(
    formData,
    diagnosticos,
    medicacionHabitual,
    signature
  ),
  examenes: formData.examenesSolicitados || null,
  medicamentos: rxList.map(mapRxToMedicationRow).filter((item) => isMeaningfulValue(item)),
  infusiones: infusiones.map(mapInfusionRowToSupabase).filter((item) => isMeaningfulValue(item)),
  nutricion: {
    dieta: signosVitales.dietaIndicada || null,
    observacion: medicacionHabitual.observaciones || null,
    interconsulta: formData.examenesResultados || null,
  },
  signos_vitales: {
    temperatura: { manana: signosVitales.temp || null },
    presion_arterial: { manana: signosVitales.pa || null },
    frecuencia_cardiaca: { manana: signosVitales.fc || null },
    sat_o2: { manana: signosVitales.spo2 || null },
  },
});

const hasClinicalPayloadData = ({ formData, rxList, infusiones, diagnosticos, medicacionHabitual }) =>
  [
    formData.subjetivo,
    formData.objetivo,
    formData.analisis,
    formData.bienestar,
    formData.intervenciones,
    formData.evaluacion,
    formData.enfermeria,
    formData.observaciones,
    formData.examenesSolicitados,
    formData.examenesResultados,
    rxList.length,
    infusiones.length,
    diagnosticos.length,
    medicacionHabitual.rows?.length || 0,
    medicacionHabitual.alergias,
    medicacionHabitual.observaciones,
  ].some((value) => isMeaningfulValue(value));

const Evolucion = () => {
  const { mainId } = useParams();

  const [admision, setAdmision] = useState(null);
  const [loadingAdmision, setLoadingAdmision] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [infusiones, setInfusiones] = useState([]);
  const [medicacionHabitual, setMedicacionHabitual] = useState(INITIAL_MEDICACION_HABITUAL);
  const [signature, setSignature] = useState(INITIAL_SIGNATURE);
  const [signosVitales, setSignosVitales] = useState(INITIAL_SIGNOS);
  const [loadingSignos, setLoadingSignos] = useState(true);
  const [savingEvolution, setSavingEvolution] = useState(false);
  const [errorSignos, setErrorSignos] = useState(false);
  const [lastSignosAt, setLastSignosAt] = useState("");
  const [lastEvolutionAt, setLastEvolutionAt] = useState("");
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");
  const [auditoriaOpen, setAuditoriaOpen] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    tone: "success",
  });
  const [discontinuarDraft, setDiscontinuarDraft] = useState({
    id: null,
    motivo: "",
    observacion: "",
  });

  const pacienteNombre = useMemo(() => {
    const nombre = [admision?.firstName, admision?.lastName]
      .map((value) => toStringSafe(value).trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    return nombre || "";
  }, [admision]);

  const diagnosticoPrincipal = useMemo(
    () => toStringSafe(admision?.diagnostico).trim(),
    [admision]
  );

  const pacienteMeta = useMemo(() => {
    const piso = toStringSafe(admision?.ubicacion?.piso).trim();
    const habitacion = toStringSafe(admision?.ubicacion?.habitacion).trim();
    const cama = [piso, habitacion].filter(Boolean).join(" · ") || habitacion || piso || "";

    return {
      admisionId: mainId || null,
      cama,
      medico: toStringSafe(admision?.medico).trim(),
      bodega: "Farmacia Central",
      area: toStringSafe(admision?.servicio).trim(),
    };
  }, [admision, mainId]);

  const prescripcionesStorageKey = useMemo(
    () => `atlas_evolucion_prescripciones_v2:${mainId || "sin-admision"}`,
    [mainId]
  );

  const extraStorageKey = useMemo(
    () => `atlas_evolucion_ui_v3:${mainId || "sin-admision"}`,
    [mainId]
  );

  const showToast = useCallback((message, tone = "success") => {
    setToast({
      visible: true,
      message,
      tone,
    });
  }, []);

  const {
    rxList,
    farmaciaQueue,
    stats,
    viaOptions,
    frecuenciaOptions,
    searchMedicamentos,
    addRxFromCatalog,
    addSolicitudFarmacia,
    updateRxField,
    removeRx,
    toggleUrgente,
    sendRxToFarmacia,
    sendAllToFarmacia,
    dispatchRxFromFarmacia,
    discontinueRx,
    registrarDosis,
    eliminarDosis,
    confirmarDevolucion,
    hydratePrescripciones,
  } = usePrescripciones({
    pacienteNombre,
    pacienteMeta,
    storageKey: prescripcionesStorageKey,
  });

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timeoutId = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast.visible]);

  useEffect(() => {
    let active = true;

    const loadAdmision = async () => {
      if (!mainId) {
        if (!active) return;
        setAdmision(null);
        setLoadingAdmision(false);
        return;
      }

      setLoadingAdmision(true);

      try {
        const data = await getAdmisionForModuleById(mainId);
        if (!active) return;
        setAdmision(data || null);
      } catch (error) {
        console.error("Error cargando admision para evolucion:", error);
        if (!active) return;
        setAdmision(null);
      } finally {
        if (active) setLoadingAdmision(false);
      }
    };

    loadAdmision();

    return () => {
      active = false;
    };
  }, [mainId]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      medico: prev.medico || toStringSafe(admision?.medico).trim(),
      fecha: prev.fecha || getNowDateTimeLocal(),
    }));
  }, [admision]);

  const loadLatestSignos = useCallback(async () => {
    if (!mainId) {
      setLoadingSignos(false);
      setSignosVitales(INITIAL_SIGNOS);
      setErrorSignos(false);
      setLastSignosAt("");
      return;
    }

    setLoadingSignos(true);
    setErrorSignos(false);

    try {
      const latest = await getLatestSignosVitalesByAdmisionId(mainId);
      if (!latest) {
        setSignosVitales(INITIAL_SIGNOS);
        setLastSignosAt("");
        return;
      }

      setSignosVitales({
        pa: toStringSafe(latest.presion),
        fc: toStringSafe(latest.pulso),
        fr: toStringSafe(latest.fr),
        temp: toStringSafe(latest.temperatura),
        spo2: toStringSafe(latest.satO2),
        glucosa: toStringSafe(latest.glucosa),
        peso: toStringSafe(latest.peso),
        diuresis: toStringSafe(latest.diuresis),
        actividadMovilizacion: toStringSafe(latest.actividadMovilizacion),
        dietaIndicada: toStringSafe(latest.dietaIndicada),
      });
      setLastSignosAt(formatDateTime(latest.createdAt));
    } catch (error) {
      console.error("Error cargando signos vitales:", error);
      setErrorSignos(true);
      setSignosVitales(INITIAL_SIGNOS);
      setLastSignosAt("");
    } finally {
      setLoadingSignos(false);
    }
  }, [mainId]);

  useEffect(() => {
    let localDraft = null;

    setFormData({
      ...INITIAL_FORM_DATA,
      fecha: getNowDateTimeLocal(),
    });
    setDiagnosticos([]);
    setInfusiones([]);
    setMedicacionHabitual(INITIAL_MEDICACION_HABITUAL);
    setSignature(INITIAL_SIGNATURE);
    setPinModalOpen(false);
    setPinValue("");
    setPinError("");

    if (mainId) {
      try {
        const raw = window.localStorage.getItem(extraStorageKey);
        if (raw) {
          localDraft = JSON.parse(raw);
          setFormData({
            ...INITIAL_FORM_DATA,
            fecha: getNowDateTimeLocal(),
            ...(localDraft.formData || {}),
          });
          setDiagnosticos(Array.isArray(localDraft.diagnosticos) ? localDraft.diagnosticos : []);
          setInfusiones(Array.isArray(localDraft.infusiones) ? localDraft.infusiones : []);
          setMedicacionHabitual({
            ...INITIAL_MEDICACION_HABITUAL,
            ...(localDraft.medicacionHabitual || {}),
          });
          setSignature({
            ...INITIAL_SIGNATURE,
            ...(localDraft.signature || {}),
          });
        }
      } catch (error) {
        console.error("No se pudo cargar el borrador local de evolución:", error);
      }
    }

    loadLatestSignos();

    const loadLatestEvolution = async () => {
      if (!mainId) {
        setLastEvolutionAt("");
        return;
      }

      try {
        const evoluciones = await getClinicalEvolutionFull(mainId);
        const latest = evoluciones?.[0];
        if (!latest) {
          setLastEvolutionAt("");
          return;
        }

        setLastEvolutionAt(formatDateTime(latest.created_at));

        if (localDraft) return;

        const evolucionSections = parseSectionDocument(latest.evolucion);
        const observacionesSections = parseSectionDocument(latest.observaciones);
        const nutricion = Array.isArray(latest.nutricion) ? latest.nutricion[0] : latest.nutricion;
        const signs = Array.isArray(latest.signos_vitales_y_actividades)
          ? latest.signos_vitales_y_actividades[0]
          : latest.signos_vitales_y_actividades;

        setFormData((prev) => ({
          ...prev,
          subjetivo: evolucionSections.SUBJETIVO || "",
          objetivo: evolucionSections.OBJETIVO || "",
          analisis: latest.analisis || "",
          bienestar: evolucionSections.BIENESTAR || "",
          intervenciones: evolucionSections.INTERVENCIONES || "",
          evaluacion: evolucionSections.EVALUACION_PLAN || "",
          enfermeria: latest.enfermeria || "",
          observaciones: observacionesSections.OBSERVACIONES_GENERALES || "",
          examenesSolicitados: latest.examen_solicitados || "",
          examenesResultados:
            observacionesSections.EXAMENES_RESULTADOS || nutricion?.interconsulta || "",
        }));

        if (Array.isArray(latest.infusiones)) {
          setInfusiones(
            latest.infusiones.map((item) => ({
              solucion: item.tipo || "",
              volumen: "",
              velocidad: item.frecuencia || "",
              aditivos: item.indicacion || "",
              via: "",
              inicio: "",
              duracion: "",
              estado: "",
            }))
          );
        }

        setMedicacionHabitual((prev) => ({
          ...prev,
          alergias: observacionesSections.ALERGIAS_MEDICAMENTOSAS || prev.alergias,
          observaciones:
            observacionesSections.ADHERENCIA_Y_OBSERVACIONES || prev.observaciones,
        }));

        if (signs) {
          setSignosVitales((prev) => ({
            ...prev,
            pa: prev.pa || toStringSafe(signs.presion_manana),
            fc: prev.fc || toStringSafe(signs.frecuencia_cardiaca_manana),
            temp: prev.temp || toStringSafe(signs.temperatura_manana),
            spo2: prev.spo2 || toStringSafe(signs.sat_manana),
          }));
        }

        if (rxList.length === 0 && Array.isArray(latest.medicamentos)) {
          hydratePrescripciones({
            rxList: latest.medicamentos.map((item, index) => mapMedicationRowToRx(item, index)),
            farmaciaQueue: [],
            rxCounter: latest.medicamentos.length,
          });
        }
      } catch (error) {
        console.error("Error cargando evolución clínica completa:", error);
      }
    };

    loadLatestEvolution();
  }, [extraStorageKey, hydratePrescripciones, loadLatestSignos, mainId]);

  useEffect(() => {
    if (!mainId) return;
    try {
      window.localStorage.setItem(
        extraStorageKey,
        JSON.stringify({
          formData,
          diagnosticos,
          infusiones,
          medicacionHabitual,
          signature,
        })
      );
    } catch (error) {
      console.error("No se pudo persistir el borrador local de evolución:", error);
    }
  }, [diagnosticos, extraStorageKey, formData, infusiones, mainId, medicacionHabitual, signature]);

  const hasSignosData = useMemo(
    () => Object.values(signosVitales).some((value) => String(value || "").trim().length > 0),
    [signosVitales]
  );

  const signedBadge = useMemo(() => {
    if (!signature.firmado) return "";
    return signature.ts || "Firmado digitalmente";
  }, [signature]);

  const handleSignoFieldChange = (field, value) => {
    setSignosVitales((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadLastSavedEvolution = useCallback(async () => {
    if (!mainId) {
      setLastEvolutionAt("");
      return;
    }

    try {
      const evoluciones = await getClinicalEvolutionFull(mainId);
      setLastEvolutionAt(formatDateTime(evoluciones?.[0]?.created_at));
    } catch (error) {
      console.error("Error recargando fecha de evolución:", error);
    }
  }, [mainId]);

  const executeSave = useCallback(async (signatureState = signature) => {
    if (!mainId) {
      showToast("No existe una admisión activa para guardar.", "error");
      return;
    }

    setSavingEvolution(true);
    setErrorSignos(false);

    const shouldCreateEvolution = hasClinicalPayloadData({
      formData,
      rxList,
      infusiones,
      diagnosticos,
      medicacionHabitual,
    });

    try {
      if (hasSignosData) {
        await insertSignosVitalesByAdmisionId(mainId, {
          vitals: {
            presion: signosVitales.pa,
            pulso: signosVitales.fc,
            fr: signosVitales.fr,
            temperatura: signosVitales.temp,
            satO2: signosVitales.spo2,
            glucosa: signosVitales.glucosa,
            peso: signosVitales.peso,
            diuresis: signosVitales.diuresis,
            actividadMovilizacion: signosVitales.actividadMovilizacion,
            dietaIndicada: signosVitales.dietaIndicada,
          },
          horaRegistro: new Date().toLocaleTimeString("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          observaciones: formData.observaciones || "",
        });
      }

      if (shouldCreateEvolution) {
        await createClinicalEvolutionWithDetails(
          buildEvolutionPayload({
            admisionId: mainId,
            formData,
            signosVitales,
            rxList,
            infusiones,
            diagnosticos,
            medicacionHabitual,
            signature: signatureState,
          })
        );
      }

      await loadLatestSignos();
      await loadLastSavedEvolution();
      showToast(
        signatureState?.firmado
          ? "Evolución guardada y firmada correctamente."
          : "Evolución guardada correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error guardando evolución clínica:", error);
      setErrorSignos(true);
      showToast(
        error?.message || "No se pudo guardar la evolución clínica en Supabase.",
        "error"
      );
    } finally {
      setSavingEvolution(false);
    }
  }, [
    diagnosticos,
    formData,
    hasSignosData,
    infusiones,
    loadLastSavedEvolution,
    loadLatestSignos,
    mainId,
    medicacionHabitual,
    rxList,
    showToast,
    signature,
    signosVitales,
  ]);

  const handleSave = useCallback(() => {
    if (signature.firmado || (!formData.medico.trim() && !formData.codigo.trim())) {
      executeSave(signature);
      return;
    }

    setPinValue("");
    setPinError("");
    setPinModalOpen(true);
  }, [executeSave, formData.codigo, formData.medico, signature]);

  const handleConfirmSignature = async () => {
    if (pinValue.trim().length < 4) {
      setPinError("Ingresa el PIN del certificado con al menos 4 dígitos.");
      return;
    }

    const nextSignature = createSignatureState(formData);
    setSignature(nextSignature);
    setPinModalOpen(false);
    setPinValue("");
    setPinError("");
    await executeSave(nextSignature);
  };

  const handleOpenDiscontinue = (id) => {
    setDiscontinuarDraft({
      id,
      motivo: "",
      observacion: "",
    });
  };

  const handleCloseDiscontinue = () => {
    setDiscontinuarDraft({
      id: null,
      motivo: "",
      observacion: "",
    });
  };

  const handleConfirmDiscontinue = () => {
    if (!discontinuarDraft.id || !discontinuarDraft.motivo.trim()) return;
    discontinueRx(
      discontinuarDraft.id,
      discontinuarDraft.motivo.trim(),
      discontinuarDraft.observacion.trim()
    );
    showToast("Prescripción descontinuada.", "warning");
    handleCloseDiscontinue();
  };

  const handleSendAllToFarmacia = () => {
    const pending = rxList.filter((item) => item.status === "pendiente").length;
    sendAllToFarmacia();
    if (pending > 0) {
      showToast(`${pending} prescripción(es) enviadas a farmacia.`, "success");
    }
  };

  const pendingAuditItems = useMemo(
    () =>
      rxList.filter(
        (item) => item.status === "despachada" || Number(item.devolucion || 0) > 0
      ),
    [rxList]
  );

  return (
    <div className="evolucion">
      <main className="app">
        <SignosVitales
          value={signosVitales}
          loading={loadingSignos}
          hasData={hasSignosData}
          hasError={errorSignos}
          lastUpdated={lastSignosAt}
          onFieldChange={handleSignoFieldChange}
        />

        <SoabieForm data={formData} setData={setFormData} />
        <DiagnosticoCIE10 rows={diagnosticos} onChangeRows={setDiagnosticos} />
        <InfusionesTable value={infusiones} onChange={setInfusiones} />

        <PrescripcionMedica
          rxList={rxList}
          stats={stats}
          viaOptions={viaOptions}
          frecuenciaOptions={frecuenciaOptions}
          searchMedicamentos={searchMedicamentos}
          onAddRx={(med) => {
            addRxFromCatalog(med);
            showToast(`${med.nom || med.nombre || "Medicamento"} agregado al Kárdex.`, "success");
          }}
          onAddSolicitud={(form) => {
            addSolicitudFarmacia(form);
            showToast("Solicitud enviada al panel de farmacia.", "success");
          }}
          onUpdateRx={updateRxField}
          onRemoveRx={removeRx}
          onToggleUrgente={toggleUrgente}
          onSendRx={(id) => {
            sendRxToFarmacia(id);
            showToast("Prescripción enviada a farmacia.", "success");
          }}
          onSendAll={handleSendAllToFarmacia}
          onDiscontinueRx={handleOpenDiscontinue}
          onRegistrarDosis={registrarDosis}
          onEliminarDosis={eliminarDosis}
        />

        <FarmaciaPanel
          queue={farmaciaQueue}
          onDespachar={(id) => {
            dispatchRxFromFarmacia(id);
            showToast("Medicamento despachado.", "success");
          }}
          onConfirmarDevolucion={(id) => {
            confirmarDevolucion(id);
            showToast("Devolución confirmada.", "success");
          }}
        />

        <MedicionHabitual
          searchMedicamentos={searchMedicamentos}
          value={medicacionHabitual}
          onChange={setMedicacionHabitual}
        />

        <ExamenesComplementarios data={formData} setData={setFormData} />
        <FirmaMedica
          data={formData}
          setData={setFormData}
          signature={signature}
          onOpenSignModal={() => {
            setPinError("");
            setPinValue("");
            setPinModalOpen(true);
          }}
          isSigning={savingEvolution}
        />
      </main>

      <BottomBar
        paciente={loadingAdmision ? "Cargando..." : pacienteNombre}
        dx={diagnosticoPrincipal}
        prescripciones={stats.totalRx}
        farmaciaPendientes={stats.pendientesFarmacia}
        onGuardar={handleSave}
        onEnviarFarmacia={handleSendAllToFarmacia}
        onAuditoria={() => setAuditoriaOpen(true)}
      />

      {toast.visible ? (
        <div
          id="toast"
          className="show"
          style={{
            background:
              toast.tone === "error"
                ? "var(--red)"
                : toast.tone === "warning"
                  ? "var(--amber)"
                  : "var(--teal)",
            color: toast.tone === "warning" ? "var(--navy-d)" : "white",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {(savingEvolution || signedBadge || lastEvolutionAt) ? (
        <div className="farmacia-alert">
          {savingEvolution ? (
            <div className="f-alert show">
              <span className="f-alert-icon">💾</span>
              <div className="f-alert-body">
                <div className="f-alert-title">Guardando evolución</div>
                <div className="f-alert-sub">
                  Persistiendo signos vitales y evolución clínica en Supabase...
                </div>
              </div>
            </div>
          ) : null}

          {!savingEvolution && signedBadge ? (
            <div className="f-alert show">
              <span className="f-alert-icon">🔐</span>
              <div className="f-alert-body">
                <div className="f-alert-title">Firma digital activa</div>
                <div className="f-alert-sub">{signedBadge}</div>
              </div>
            </div>
          ) : null}

          {!savingEvolution && lastEvolutionAt ? (
            <div className="f-alert show">
              <span className="f-alert-icon">🕓</span>
              <div className="f-alert-body">
                <div className="f-alert-title">Última evolución en Supabase</div>
                <div className="f-alert-sub">{lastEvolutionAt}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {pinModalOpen ? (
        <div className="modal-overlay" onClick={() => !savingEvolution && setPinModalOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 440 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header ch-navy">
              <div className="card-icon">🔐</div>
              <span className="card-title">Confirmar firma digital</span>
            </div>

            <div className="modal-body">
              <div
                style={{
                  marginBottom: 14,
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="fl">Firmante</div>
                <div style={{ fontSize: ".9rem", fontWeight: 700, color: "var(--navy-d)" }}>
                  {formData.medico || "Médico responsable"}
                </div>
                <div style={{ fontSize: ".74rem", color: "var(--dim)", marginTop: 4 }}>
                  {formData.codigo || "Sin matrícula registrada"}
                </div>
              </div>

              <div className="fg">
                <label className="fl">PIN del certificado</label>
                <input
                  className="fi"
                  type="password"
                  value={pinValue}
                  onChange={(event) => {
                    setPinValue(event.target.value);
                    setPinError("");
                  }}
                  placeholder="••••"
                  autoFocus
                />
              </div>

              {pinError ? (
                <div className="rx-devolucion-alert" style={{ marginTop: 10 }}>
                  {pinError}
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setPinModalOpen(false)}
                disabled={savingEvolution}
              >
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleConfirmSignature}>
                Firmar y guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {auditoriaOpen ? (
        <div className="modal-overlay" onClick={() => setAuditoriaOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 680 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header ch-amber">
              <div className="card-icon">📦</div>
              <span className="card-title">Auditoría de devoluciones y despacho</span>
            </div>

            <div className="modal-body">
              {pendingAuditItems.length === 0 ? (
                <div className="rx-item">
                  <div className="rx-body">No hay medicamentos despachados o con devoluciones.</div>
                </div>
              ) : (
                pendingAuditItems.map((item) => (
                  <div key={item.id} className="rx-item" style={{ marginBottom: 10 }}>
                    <div className="rx-body">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: ".88rem",
                              fontWeight: 700,
                              color: "var(--navy-d)",
                            }}
                          >
                            {item.nom}
                          </div>
                          <div style={{ fontSize: ".72rem", color: "var(--dim)", marginTop: 4 }}>
                            {item.dosis || "-"} · {item.frec || "-"} · {item.via || "-"}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div className={`rx-status-badge ${item.status}`}>{item.status}</div>
                          <div style={{ fontSize: ".72rem", color: "var(--dim)", marginTop: 4 }}>
                            {item.devolucion > 0
                              ? `${item.devolucion} unidad(es) por devolver`
                              : "Sin devolución pendiente"}
                          </div>
                        </div>
                      </div>

                      {(item.dosisLog || []).length > 0 ? (
                        <div style={{ marginTop: 10 }}>
                          <div className="fl">Trazabilidad de dosis</div>
                          <div className="dosis-timeline">
                            {item.dosisLog.map((log, index) => (
                              <div
                                key={`${item.id}-${log.hora}-${index}`}
                                className={`dosis-row ${
                                  log.tipo === "admin" ? "admin" : "omitida"
                                }`}
                              >
                                <span className="dosis-hora">{log.hora}</span>
                                <span
                                  className={`dosis-badge ${
                                    log.tipo === "admin" ? "adm" : "omit"
                                  }`}
                                >
                                  {log.tipo === "admin" ? "Administrada" : "Omitida"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => setAuditoriaOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {discontinuarDraft.id ? (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header ch-red">
              <div className="card-icon">⛔</div>
              <span className="card-title">Descontinuar medicamento</span>
            </div>

            <div className="modal-body">
              <div className="fg">
                <label className="fl">Motivo clinico *</label>
                <input
                  className="fi"
                  value={discontinuarDraft.motivo}
                  onChange={(event) =>
                    setDiscontinuarDraft((prev) => ({
                      ...prev,
                      motivo: event.target.value,
                    }))
                  }
                  placeholder="Ej: evento adverso, cambio terapéutico, alta médica"
                />
              </div>

              <div className="fg">
                <label className="fl">Observación</label>
                <textarea
                  className="fta"
                  value={discontinuarDraft.observacion}
                  onChange={(event) =>
                    setDiscontinuarDraft((prev) => ({
                      ...prev,
                      observacion: event.target.value,
                    }))
                  }
                  placeholder="Detalles adicionales de la descontinuación"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={handleCloseDiscontinue}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleConfirmDiscontinue}>
                Confirmar descontinuación
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Evolucion;
