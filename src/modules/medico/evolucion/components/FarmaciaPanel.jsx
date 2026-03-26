export default function FarmaciaPanel({ queue = [] }) {
  return (
    <div className="farmacia-panel">
      <div className="farmacia-header">
        <div className="farmacia-icon">🏥</div>

        <div className="fq-info">
          <div className="farmacia-title">Panel de Farmacia</div>
          <div className="farmacia-sub">
            Cola de despacho en tiempo real — Clínicas Atlas
          </div>
        </div>

        <div className="fq-actions">
          <div className="fq-dot despachada" />
          <span className="farmacia-sub">Farmacia en línea</span>
          <span className="card-badge">{queue.length} pendientes</span>
        </div>
      </div>

      <div className="farmacia-body">
        <div className="farmacia-queue">
          {queue.length === 0 ? (
            <div className="fq-item">
              <div className="fq-info">
                <div className="fq-detail">
                  Cola vacía — envíe prescripciones desde el panel de
                  medicamentos
                </div>
              </div>
            </div>
          ) : (
            queue.map((item, i) => (
              <div
                key={i}
                className={`fq-item${item.urgente ? " urgente" : ""}${
                  item.estado === "despachada" ? " despachada" : ""
                }`}
              >
                <div className="fq-num">{i + 1}</div>
                <div
                  className={`fq-dot ${
                    item.estado === "despachada"
                      ? "despachada"
                      : item.urgente
                      ? "urgente"
                      : "pendiente"
                  }`}
                />

                <div className="fq-info">
                  <div className="fq-med">
                    {item.nombre || item.nom || "Medicamento"}
                  </div>
                  <div className="fq-detail">
                    {item.conc || "—"} · {item.via || "—"} ·{" "}
                    {item.frecuencia || item.frec || "—"}
                  </div>
                  <div className="fq-pac">{item.paciente || "Paciente"}</div>
                </div>

                <div className="fq-actions">
                  <button
                    type="button"
                    className={`fq-btn ${
                      item.estado === "despachada" ? "done" : "despachar"
                    }`}
                  >
                    {item.estado === "despachada" ? "Despachado" : "Despachar"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
