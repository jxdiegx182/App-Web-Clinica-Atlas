import { useMemo, useState } from "react";
import RxItem from "./RxItem";
import SolicitudFarmaciaModal from "./SolicitudFarmaciaModal";

const STATUS_CLR = {
  pendiente: "var(--amber)",
  enviada: "var(--blue)",
  despachada: "var(--green)",
  descontinuada: "var(--red)",
};

function MedBuscador({
  value,
  results,
  loading,
  onChange,
  onSelect,
  shouldOpenDropdown,
}) {
  return (
    <div className="cie-wrap" style={{ marginBottom: 0 }}>
      <input
        className="cie-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar medicamento por genérico, comercial o categoría"
        autoComplete="off"
      />
      <span className="cie-icon">🔎</span>

      <div className={`cie-drop ${shouldOpenDropdown ? "open" : ""}`}>
        {loading ? <div className="cie-opt">Buscando en Supabase...</div> : null}

        {!loading && shouldOpenDropdown && results.length === 0 ? (
          <div className="cie-opt">Sin resultados</div>
        ) : null}

        {!loading
          ? results.map((med) => (
              <div
                key={med.id}
                className="cie-opt"
                onMouseDown={() => onSelect(med)}
              >
                <span className="cie-opt-code">MED</span>
                <div>
                  <div className="cie-opt-desc">{med.nombre}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--dim)" }}>
                    {med.comercial || "Sin comercial"}
                    {med.concentracion ? ` · ${med.concentracion}` : ""}
                    {med.categoria ? ` · ${med.categoria}` : ""}
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

function SummaryChip({ label, value, color }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: `1px solid ${color}44`,
        background: `${color}14`,
        minWidth: 96,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: ".95rem",
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: ".62rem",
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

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
  const [selectedMed, setSelectedMed] = useState(null);
  const [form, setForm] = useState({
    dosis: "",
    frec: "",
    via: "",
    dur: "",
    urgente: false,
  });

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
    try {
      const data = await searchMedicamentos(value);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const selectMed = (med) => {
    setSelectedMed(med);
    setSearch("");
    setResults([]);
    setForm((prev) => ({
      ...prev,
      dosis: med.dosis || med.concentracion?.split("/")[0]?.trim() || prev.dosis,
      frec: med.frecuencia || prev.frec,
      via: med.via || prev.via,
      dur: med.duracion || prev.dur,
    }));
  };

  const resetForm = () => {
    setSelectedMed(null);
    setSearch("");
    setResults([]);
    setForm({
      dosis: "",
      frec: "",
      via: "",
      dur: "",
      urgente: false,
    });
  };

  const addCatalogMed = () => {
    if (!selectedMed) return;

    onAddRx({
      nom: selectedMed.nombre,
      com: selectedMed.comercial,
      conc: selectedMed.concentracion,
      dosis: form.dosis,
      via: form.via,
      frec: form.frec,
      dur: form.dur,
      status: "pendiente",
      urgente: form.urgente,
      solicitudFarmacia: false,
    });

    resetForm();
  };

  return (
    <div className="card">
      <div className="card-header ch-purple">
        <div className="card-icon">💊</div>
        <span className="card-title">Prescripciones Médicas — Kárdex</span>
        <span className="card-badge">{stats.totalRx} medicamentos</span>
      </div>

      <div className="card-body">
        <div className="sl">Agregar medicamento</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px,2fr) repeat(3, minmax(120px, 1fr)) auto",
            gap: 8,
            alignItems: "end",
            marginBottom: 12,
          }}
        >
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Medicamento *</label>
            <MedBuscador
              value={search}
              results={filteredResults}
              loading={loading}
              onChange={handleSearch}
              onSelect={selectMed}
              shouldOpenDropdown={shouldOpenDropdown}
            />
            {selectedMed ? (
              <div
                style={{
                  fontSize: ".68rem",
                  color: "var(--teal-d)",
                  marginTop: 4,
                  fontWeight: 700,
                }}
              >
                {selectedMed.nombre}
                {selectedMed.concentracion ? ` — ${selectedMed.concentracion}` : ""}
              </div>
            ) : null}
          </div>

          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Dosis</label>
            <input
              className="fi"
              value={form.dosis}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dosis: event.target.value }))
              }
              placeholder="Ej: 500mg"
            />
          </div>

          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Frecuencia</label>
            <select
              className="fs"
              value={form.frec}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, frec: event.target.value }))
              }
            >
              {frecuenciaOptions.map((option) => (
                <option key={option || "frecuencia-vacia"} value={option}>
                  {option || "- Seleccione -"}
                </option>
              ))}
            </select>
          </div>

          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Vía</label>
            <select
              className="fs"
              value={form.via}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, via: event.target.value }))
              }
            >
              {viaOptions.map((option) => (
                <option key={option || "via-vacia"} value={option}>
                  {option || "- Seleccione -"}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={addCatalogMed}
            disabled={!selectedMed}
            style={{
              padding: "9px 18px",
              background: selectedMed ? "var(--purple)" : "#a0aec0",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontFamily: "inherit",
              fontSize: ".78rem",
              fontWeight: 700,
              cursor: selectedMed ? "pointer" : "not-allowed",
              minHeight: 42,
            }}
          >
            + Agregar
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div className="fg" style={{ margin: 0 }}>
            <label className="fl">Duración</label>
            <input
              className="fi"
              value={form.dur}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dur: event.target.value }))
              }
              placeholder="Ej: 5 días"
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${form.urgente ? "var(--red-mid)" : "var(--border)"}`,
              background: form.urgente ? "var(--red-l)" : "white",
            }}
          >
            <input
              id="rx-urgente-form"
              type="checkbox"
              checked={form.urgente}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, urgente: event.target.checked }))
              }
            />
            <label
              htmlFor="rx-urgente-form"
              style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--navy-d)" }}
            >
              Marcar como urgente
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button type="button" className="btn-outline" onClick={resetForm}>
              Limpiar
            </button>
            <button type="button" className="btn-outline" onClick={onSendAll}>
              Enviar todo a farmacia
            </button>
            <button type="button" className="btn-add-row" onClick={() => setOpenModal(true)}>
              Solicitar medicamento no disponible
            </button>
          </div>
        </div>

        {rxList.length > 0 ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <SummaryChip label="Pendientes" value={stats.totalRx - stats.despachadas} color="var(--amber)" />
            <SummaryChip label="Despachadas" value={stats.despachadas} color="var(--green)" />
            <SummaryChip label="En farmacia" value={stats.pendientesFarmacia} color="var(--blue)" />
            <SummaryChip
              label="Devoluciones"
              value={stats.devolucionesPendientes}
              color="var(--red)"
            />
          </div>
        ) : null}

        {rxList.length === 0 ? (
          <div className="rx-item">
            <div className="rx-body">Sin prescripciones activas</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto", marginBottom: 12 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: ".77rem",
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg,var(--navy),var(--navy-mid))",
                    }}
                  >
                    {["Medicamento", "Dosis", "Frecuencia", "Vía", "Cálculo", "Estado"].map(
                      (header) => (
                        <th
                          key={header}
                          style={{
                            padding: "8px 10px",
                            color: "white",
                            fontSize: ".62rem",
                            fontWeight: 700,
                            letterSpacing: ".06em",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rxList.map((rx) => (
                    <tr
                      key={`summary-${rx.id}`}
                      style={{
                        borderBottom: "1px solid var(--surface2)",
                        opacity: rx.status === "descontinuada" ? 0.55 : 1,
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--navy-d)" }}>
                        {rx.urgente ? <span style={{ color: "var(--red)", marginRight: 4 }}>🚨</span> : null}
                        {rx.nom || "Medicamento"}
                        {rx.com ? (
                          <div style={{ fontSize: ".68rem", color: "var(--dim)", fontWeight: 400 }}>
                            {rx.com}
                          </div>
                        ) : null}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {rx.dosis || rx.conc || "—"}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--dim)" }}>{rx.frec || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>{rx.via || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "var(--teal-d)", fontSize: ".68rem" }}>
                        {rx.calcTxt || "—"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 100,
                            fontSize: ".62rem",
                            fontWeight: 700,
                            background: `${STATUS_CLR[rx.status] || "var(--dim)"}22`,
                            color: STATUS_CLR[rx.status] || "var(--dim)",
                            border: `1px solid ${STATUS_CLR[rx.status] || "var(--border)"}55`,
                          }}
                        >
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rxList.map((rx, index) => (
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
            ))}
          </>
        )}
      </div>

      <SolicitudFarmaciaModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(formValue) => {
          onAddSolicitud(formValue);
          setOpenModal(false);
        }}
      />
    </div>
  );
}
