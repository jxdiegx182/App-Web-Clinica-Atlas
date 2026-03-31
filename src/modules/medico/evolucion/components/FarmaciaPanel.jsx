import { useMemo, useState } from "react";

function CounterPill({ label, value, color }) {
  return (
    <div
      style={{
        minWidth: 88,
        padding: "8px 12px",
        borderRadius: 10,
        border: `1px solid ${color}55`,
        background: `${color}18`,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "1.1rem",
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
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <tr>
      <td
        style={{
          padding: "8px 10px",
          width: "40%",
          color: "var(--dim)",
          fontWeight: 700,
          borderBottom: "1px solid var(--surface2)",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "8px 10px",
          color: "var(--navy-d)",
          borderBottom: "1px solid var(--surface2)",
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
          fontSize: mono ? ".72rem" : ".78rem",
        }}
      >
        {String(value)}
      </td>
    </tr>
  );
}

export default function FarmaciaPanel({ queue = [], onDespachar, onConfirmarDevolucion }) {
  const [filter, setFilter] = useState("todas");
  const [detailItem, setDetailItem] = useState(null);

  const counters = useMemo(
    () => ({
      total: queue.length,
      enviada: queue.filter((item) => item.status === "enviada").length,
      despachada: queue.filter((item) => item.status === "despachada").length,
      descontinuada: queue.filter((item) => item.status === "descontinuada").length,
    }),
    [queue]
  );

  const items = useMemo(() => {
    const filtered =
      filter === "todas" ? queue : queue.filter((item) => item.status === filter);
    return [...filtered].sort((a, b) => {
      if (a.urgente !== b.urgente) return a.urgente ? -1 : 1;
      return String(a.hora || "").localeCompare(String(b.hora || ""));
    });
  }, [filter, queue]);

  const filterOptions = [
    { key: "todas", label: "Todas" },
    { key: "enviada", label: "En farmacia" },
    { key: "despachada", label: "Despachadas" },
    { key: "descontinuada", label: "Descontinuadas" },
  ];

  return (
    <>
      <div className="farmacia-panel">
        <div className="farmacia-header">
          <div className="farmacia-icon">🏥</div>

          <div className="fq-info">
            <div className="farmacia-title">Panel de Farmacia</div>
            <div className="farmacia-sub">Cola clínica vinculada con prescripciones activas</div>
          </div>

          <div className="fq-actions">
            <div className="fq-dot pendiente" />
            <span className="farmacia-sub">{counters.enviada} pendiente(s)</span>
          </div>
        </div>

        <div className="farmacia-body">
          {counters.total > 0 ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <CounterPill label="Total" value={counters.total} color="var(--navy-d)" />
              <CounterPill label="En farmacia" value={counters.enviada} color="var(--blue)" />
              <CounterPill label="Despachadas" value={counters.despachada} color="var(--green)" />
              <CounterPill
                label="Descontinuadas"
                value={counters.descontinuada}
                color="var(--red)"
              />
            </div>
          ) : null}

          {counters.total > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="btn-outline"
                  onClick={() => setFilter(option.key)}
                  style={{
                    background: filter === option.key ? "var(--amber)" : "white",
                    color: filter === option.key ? "white" : "var(--dim)",
                    borderColor: filter === option.key ? "var(--amber)" : "var(--border)",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="farmacia-queue">
            {items.length === 0 ? (
              <div className="fq-item">
                <div className="fq-info">
                  <div className="fq-detail">
                    {queue.length === 0
                      ? "No hay prescripciones enviadas a farmacia."
                      : `No hay pedidos con estado "${filter}".`}
                  </div>
                </div>
              </div>
            ) : (
              items.map((item, i) => {
                const isDespachada = item.status === "despachada";
                const isDescontinuada = item.status === "descontinuada";
                const hasDevolucion = Number(item.devolucionPendiente || 0) > 0;

                return (
                  <div
                    key={item.id}
                    className={`fq-item${item.urgente ? " urgente" : ""}${
                      isDespachada ? " despachada" : ""
                    }`}
                  >
                    <div className="fq-num">{i + 1}</div>

                    <div
                      className={`fq-dot ${
                        isDespachada ? "despachada" : item.urgente ? "urgente" : "pendiente"
                      }`}
                    />

                    <div className="fq-info">
                      <div className="fq-med">{item.nom || "Medicamento"}</div>
                      <div className="fq-detail">
                        {item.conc || "-"} · {item.via || "-"} · {item.frec || "-"}
                      </div>
                      <div className="fq-pac">
                        {item.paciente || "Paciente"} · {item.cama || item.admisionId || "--"} ·{" "}
                        {item.hora || "--:--"} · {item.farmUnidades || 1} unid.
                      </div>

                      {hasDevolucion ? (
                        <div className="rx-devolucion-alert" style={{ marginTop: 6 }}>
                          Devolución pendiente: {item.devolucionPendiente} unidad
                          {item.devolucionPendiente > 1 ? "es" : ""}
                        </div>
                      ) : null}
                    </div>

                    <div className="fq-actions" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="fq-btn"
                        style={{ background: "var(--navy-l)", color: "var(--navy-d)" }}
                        onClick={() => setDetailItem(item)}
                      >
                        Ver
                      </button>

                      {!isDespachada && !isDescontinuada ? (
                        <button
                          type="button"
                          className="fq-btn despachar"
                          onClick={() => onDespachar(item.id)}
                        >
                          Despachar
                        </button>
                      ) : isDescontinuada ? (
                        <button
                          type="button"
                          className="fq-btn done"
                          style={{ color: "var(--red-mid)" }}
                        >
                          Descontinuado
                        </button>
                      ) : (
                        <button type="button" className="fq-btn done">
                          Despachado
                        </button>
                      )}

                      {hasDevolucion && !item.devolucionConfirmadaAt ? (
                        <button
                          type="button"
                          className="fq-btn"
                          style={{ background: "var(--amber)", color: "white" }}
                          onClick={() => onConfirmarDevolucion(item.id)}
                        >
                          Confirmar devol.
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {counters.enviada > 1 ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  queue
                    .filter((item) => item.status === "enviada")
                    .forEach((item) => onDespachar(item.id));
                }}
              >
                Despachar pendientes ({counters.enviada})
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {detailItem ? (
        <div className="modal-overlay" onClick={() => setDetailItem(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 560 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header ch-amber">
              <div className="card-icon">🏥</div>
              <span className="card-title">Detalle del pedido a farmacia</span>
            </div>

            <div className="modal-body">
              {detailItem.urgente ? (
                <div className="rx-devolucion-alert" style={{ marginBottom: 12 }}>
                  Pedido marcado como urgente.
                </div>
              ) : null}

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <DetailRow label="Medicamento" value={detailItem.nom} />
                  <DetailRow label="Comercial" value={detailItem.com} />
                  <DetailRow label="Concentración" value={detailItem.conc} />
                  <DetailRow label="Dosis" value={detailItem.dosis} />
                  <DetailRow label="Frecuencia" value={detailItem.frec} />
                  <DetailRow label="Vía" value={detailItem.via} />
                  <DetailRow label="Duración" value={detailItem.dur} />
                  <DetailRow label="Paciente" value={detailItem.paciente} />
                  <DetailRow label="Cama / Ubicación" value={detailItem.cama} />
                  <DetailRow label="Médico" value={detailItem.medico} />
                  <DetailRow label="Área" value={detailItem.area} />
                  <DetailRow label="Hora del pedido" value={detailItem.hora} mono />
                  <DetailRow
                    label="Total farmacia"
                    value={detailItem.farmUnidades || detailItem.cant}
                    mono
                  />
                  <DetailRow label="Estado" value={detailItem.status} />
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => setDetailItem(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
