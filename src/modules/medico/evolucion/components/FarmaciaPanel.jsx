export default function FarmaciaPanel({
  queue = [],
  onDespachar,
  onConfirmarDevolucion,
}) {
  const pendientes = queue.filter((item) => item.status !== "despachada").length;

  return (
    <div className="farmacia-panel">
      <div className="farmacia-header">
        <div className="farmacia-icon">🏥</div>

        <div className="fq-info">
          <div className="farmacia-title">Panel de Farmacia</div>
          <div className="farmacia-sub">Cola local de evolucion (simulacion HIS)</div>
        </div>

        <div className="fq-actions">
          <div className="fq-dot pendiente" />
          <span className="farmacia-sub">{pendientes} pendiente(s)</span>
        </div>
      </div>

      <div className="farmacia-body">
        <div className="farmacia-queue">
          {queue.length === 0 ? (
            <div className="fq-item">
              <div className="fq-info">
                <div className="fq-detail">No hay prescripciones enviadas a farmacia.</div>
              </div>
            </div>
          ) : (
            queue.map((item, i) => {
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
                      {item.paciente || "Paciente"} · {item.hora || "--:--"} · {item.farmUnidades || 1} unid.
                    </div>

                    {hasDevolucion ? (
                      <div className="rx-devolucion-alert" style={{ marginTop: 6 }}>
                        Devolucion pendiente: {item.devolucionPendiente} unidad
                        {item.devolucionPendiente > 1 ? "es" : ""}
                      </div>
                    ) : null}
                  </div>

                  <div className="fq-actions">
                    {!isDespachada && !isDescontinuada ? (
                      <button
                        type="button"
                        className="fq-btn despachar"
                        onClick={() => onDespachar(item.id)}
                      >
                        Despachar
                      </button>
                    ) : isDescontinuada ? (
                      <button type="button" className="fq-btn done" style={{ color: "var(--red-mid)" }}>
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
      </div>
    </div>
  );
}
