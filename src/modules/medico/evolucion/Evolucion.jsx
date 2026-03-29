import { useState } from "react";
import SoabieForm from "./components/SoabieForm";
import DiagnosticoCIE10 from "./components/DiagnosticoCIE10";
import InfusionesTable from "./components/InfusionesTable";
import PrescripcionMedica from "./components/PrescripcionMedica";
import FarmaciaPanel from "./components/FarmaciaPanel";
import MedicionHabitual from "./components/MedicionHabitual";
import ExamenesComplementarios from "./components/ExamenesComplementarios";
import FirmaMedica from "./components/FirmaMedica";
import BottomBar from "./components/BottomBar";
import usePrescripciones from "./hook/usePrescripciones";
import "./styles/evolucion.css";

const Evolucion = () => {
  const [formData, setFormData] = useState({});
  const [discontinuarDraft, setDiscontinuarDraft] = useState({
    id: null,
    motivo: "",
    observacion: "",
  });

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
  } = usePrescripciones({ pacienteNombre: "Juan Perez" });

  const handleSave = () => {
    console.log({
      formData,
      prescripciones: rxList,
      farmacia: farmaciaQueue,
    });
    // TODO: conectar persistencia real con Supabase
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
          onSendRx={(id) => sendRxToFarmacia(id, "Juan Perez")}
          onSendAll={() => sendAllToFarmacia("Juan Perez")}
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
        paciente="Juan Perez"
        dx="Neumonia"
        prescripciones={stats.totalRx}
        farmaciaPendientes={stats.pendientesFarmacia}
        onGuardar={handleSave}
        onEnviarFarmacia={() => sendAllToFarmacia("Juan Perez")}
        onAuditoria={() => console.log("Devoluciones pendientes:", stats.devolucionesPendientes)}
      />

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
