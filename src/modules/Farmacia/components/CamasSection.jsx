export default function CamasSection({
  beds,
  search,
  onSearchChange,
  bedsFilter,
  onChangeFilter,
}) {
  const filters = [
    { key: "todas", label: "Todas" },
    { key: "pend", label: "Con Pedidos" },
    { key: "urg", label: "🚨 Urgentes" },
    { key: "uci", label: "UCI" },
    { key: "hosp", label: "Hospitalización" },
    { key: "neo", label: "Neonatología" },
    { key: "qx", label: "Quirófano" },
  ];

  return (
    <section id="sec-camas" className="sec on">
      <div className="fbar">
        <div className="sr">
          <span className="sr-ic">🔍</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar cama o paciente..."
          />
        </div>

        {filters.map((filter) => (
          <button
            key={filter.key}
            className="btn btn-ghost"
            style={{
              background: bedsFilter === filter.key ? "var(--teal3)" : "var(--bg4)",
              color: bedsFilter === filter.key ? "var(--teal2)" : "var(--muted)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onChangeFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}

        <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{beds.length} cama(s)</span>
      </div>

      <div className="cg">
        {beds.map((bed) => (
          <div
            key={bed.id}
            className={`cc ${bed.urgente ? "urg" : ""} ${bed.estado === "libre" ? "libre" : ""}`}
          >
            <div className="cc-num">{bed.id}</div>
            <div className="cc-pac">{bed.paciente || "Cama libre"}</div>
            <div className="cc-med">{bed.diagnostico || "Sin diagnóstico"}</div>
            <div className={`cc-stat ${Number(bed.pedidos || 0) > 0 ? "p" : "d"}`}>
              {Number(bed.pedidos || 0) > 0
                ? `${bed.pedidos} pedido(s) en farmacia`
                : "Sin pedidos pendientes"}
            </div>
            {bed.urgente ? <div className="cc-ub">🚨</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
