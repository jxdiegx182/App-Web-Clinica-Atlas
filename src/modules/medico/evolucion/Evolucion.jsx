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
  getAdmisionForModuleById,
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

const Evolucion = () => {
  const { mainId } = useParams();

  const [admision, setAdmision] = useState(null);
  const [loadingAdmision, setLoadingAdmision] = useState(true);
  const [formData, setFormData] = useState({});
  const [signosVitales, setSignosVitales] = useState(INITIAL_SIGNOS);
  const [loadingSignos, setLoadingSignos] = useState(true);
  const [savingSignos, setSavingSignos] = useState(false);
  const [errorSignos, setErrorSignos] = useState(false);
  const [lastSignosAt, setLastSignosAt] = useState("");
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
  } = usePrescripciones({
    pacienteNombre,
    pacienteMeta,
    storageKey: prescripcionesStorageKey,
  });

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
    loadLatestSignos();
  }, [loadLatestSignos]);

  const hasSignosData = useMemo(
    () => Object.values(signosVitales).some((value) => String(value || "").trim().length > 0),
    [signosVitales]
  );

  const handleSignoFieldChange = (field, value) => {
    setSignosVitales((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!mainId) {
      console.warn("No existe mainId para guardar signos vitales");
      return;
    }

    setSavingSignos(true);
    try {
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

      await loadLatestSignos();

      console.log({
        formData,
        signosVitales,
        prescripciones: rxList,
        farmacia: farmaciaQueue,
      });
    } catch (error) {
      console.error("Error guardando signos vitales:", error);
      setErrorSignos(true);
    } finally {
      setSavingSignos(false);
    }
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
    handleCloseDiscontinue();
  };

  return (
    <>
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
        <DiagnosticoCIE10 />
        <InfusionesTable />

        <PrescripcionMedica
          rxList={rxList}
          stats={stats}
          viaOptions={viaOptions}
          frecuenciaOptions={frecuenciaOptions}
          searchMedicamentos={searchMedicamentos}
          onAddRx={addRxFromCatalog}
          onAddSolicitud={addSolicitudFarmacia}
          onUpdateRx={updateRxField}
          onRemoveRx={removeRx}
          onToggleUrgente={toggleUrgente}
          onSendRx={sendRxToFarmacia}
          onSendAll={sendAllToFarmacia}
          onDiscontinueRx={handleOpenDiscontinue}
          onRegistrarDosis={registrarDosis}
          onEliminarDosis={eliminarDosis}
        />

        <FarmaciaPanel
          queue={farmaciaQueue}
          onDespachar={dispatchRxFromFarmacia}
          onConfirmarDevolucion={confirmarDevolucion}
        />

        <MedicionHabitual searchMedicamentos={searchMedicamentos} />

        <ExamenesComplementarios data={formData} setData={setFormData} />
        <FirmaMedica data={formData} setData={setFormData} />
      </main>

      <BottomBar
        paciente={loadingAdmision ? "Cargando..." : pacienteNombre}
        dx={diagnosticoPrincipal}
        prescripciones={stats.totalRx}
        farmaciaPendientes={stats.pendientesFarmacia}
        onGuardar={handleSave}
        onEnviarFarmacia={sendAllToFarmacia}
        onAuditoria={() => console.log("Devoluciones pendientes:", stats.devolucionesPendientes)}
      />

      {savingSignos ? (
        <div className="farmacia-alert">
          <div className="f-alert show">
            <span className="f-alert-icon">💾</span>
            <div className="f-alert-body">
              <div className="f-alert-title">Guardando evolución</div>
              <div className="f-alert-sub">Persistiendo signos vitales en Supabase...</div>
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
                  placeholder="Ej: evento adverso, cambio terapeutico, alta medica"
                />
              </div>

              <div className="fg">
                <label className="fl">Observacion</label>
                <textarea
                  className="fta"
                  value={discontinuarDraft.observacion}
                  onChange={(event) =>
                    setDiscontinuarDraft((prev) => ({
                      ...prev,
                      observacion: event.target.value,
                    }))
                  }
                  placeholder="Detalles adicionales de la descontinuacion"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={handleCloseDiscontinue}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleConfirmDiscontinue}>
                Confirmar descontinuacion
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Evolucion;
