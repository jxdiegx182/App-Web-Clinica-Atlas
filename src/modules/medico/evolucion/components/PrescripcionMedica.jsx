import { useMemo, useState } from "react";
import RxItem from "./RxItem";
import SolicitudFarmaciaModal from "./SolicitudFarmaciaModal";

export default function PrescripcionMedica({
  rxList,
  stats,
  viaOptions,
  frecuenciaOptions,
  searchMedicamentos,
  onAddRx,
  onAddSolicitud,
  onUpdateRx,
  onRemoveRx,
  onToggleUrgente,
  onSendRx,
  onSendAll,
  onDiscontinueRx,
  onRegistrarDosis,
  onEliminarDosis,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const shouldOpenDropdown = search.trim().length >= 2;

  const filteredResults = useMemo(() => {
    if (!shouldOpenDropdown) return [];
    const q = search.toLowerCase().trim();
    return results.filter((item) => {
      const nom = (item.nombre || "").toLowerCase();
      const com = (item.comercial || "").toLowerCase();
      const cat = (item.categoria || "").toLowerCase();
      return nom.includes(q) || com.includes(q) || cat.includes(q);
    });
  }, [results, search, shouldOpenDropdown]);

  const handleSearch = async (value) => {
    setSearch(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const data = await searchMedicamentos(value);
    setResults(data);
    setLoading(false);
  };

  const addCatalogMed = (med) => {
    onAddRx({
      nom: med.nombre,
      com: med.comercial,
      conc: med.concentracion,
      dosis: med.dosis,
      via: med.via,
      frec: med.frecuencia,
      dur: med.duracion,
      status: "pendiente",
      urgente: false,
      solicitudFarmacia: false,
    });
    setSearch("");
    setResults([]);
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">💊</div>
        <span className="card-title">Prescripcion Medica</span>
        <span className="card-badge">{stats.totalRx} medicamentos</span>
      </div>

      <div className="card-body">
        <div className="sl">Buscador de medicamentos</div>

        <div className="cie-wrap" style={{ marginBottom: 8 }}>
          <input
            className="cie-input"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Buscar por generico, comercial o categoria"
            autoComplete="off"
          />
          <span className="cie-icon">🔎</span>

          <div className={`cie-drop ${shouldOpenDropdown ? "open" : ""}`}>
            {loading ? <div className="cie-opt">Buscando...</div> : null}

            {!loading && shouldOpenDropdown && filteredResults.length === 0 ? (
              <div className="cie-opt">Sin resultados</div>
            ) : null}

            {!loading
              ? filteredResults.map((med) => (
                  <div key={med.id} className="cie-opt" onClick={() => addCatalogMed(med)}>
                    <span className="cie-opt-code">MED</span>
                    <div>
                      <div className="cie-opt-desc">{med.nombre}</div>
                      <div style={{ fontSize: ".72rem", color: "var(--dim)" }}>
                        {med.comercial || "Sin comercial"} - {med.categoria || "Sin categoria"}
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button className="btn-add-row" onClick={() => setOpenModal(true)}>
            Solicitar medicamento no disponible
          </button>

          <button className="btn-outline" onClick={onSendAll}>
            Enviar todo a farmacia
          </button>
        </div>

        {rxList.length === 0 ? (
          <div className="rx-item">
            <div className="rx-body">Sin prescripciones activas</div>
          </div>
        ) : (
          rxList.map((rx, index) => (
            <RxItem
              key={rx.id}
              rx={rx}
              index={index}
              viaOptions={viaOptions}
              frecuenciaOptions={frecuenciaOptions}
              onChange={onUpdateRx}
              onSend={onSendRx}
              onToggleUrgente={onToggleUrgente}
              onDiscontinue={onDiscontinueRx}
              onRemove={onRemoveRx}
              onRegistrarDosis={onRegistrarDosis}
              onEliminarDosis={onEliminarDosis}
            />
          ))
        )}
      </div>

      <SolicitudFarmaciaModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(form) => {
          onAddSolicitud(form);
          setOpenModal(false);
        }}
      />
    </div>
  );
}
