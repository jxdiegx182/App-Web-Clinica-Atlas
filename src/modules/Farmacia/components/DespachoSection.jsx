function KpiCard({ icon, label, value, tone = "kv-t", barColor, onClick }) {
  return (
    <div className="kpi" onClick={onClick}>
      <div className="kpi-bot" style={{ background: barColor }} />
      <div className="kpi-ic">{icon}</div>
      <div className={`kpi-v ${tone}`}>{value}</div>
      <div className="kpi-l">{label}</div>
    </div>
  );
}

export default function DespachoSection({
  kpis,
  orders,
  criticalInventory,
  search,
  onSearchChange,
  onDispatchAll,
  onDispatchOrder,
  onOpenPos,
  helpers,
}) {
  return (
    <section id="sec-desp" className="sec on">
      <div className="kpis" id="kpis-strip">
        <KpiCard icon="⏳" label="Pendientes" value={kpis.pendientes} tone="kv-a" barColor="var(--amber)" />
        <KpiCard icon="🚨" label="Urgentes" value={kpis.urgentes} tone="kv-r" barColor="var(--red)" />
        <KpiCard icon="✅" label="Despachados" value={kpis.despachados} tone="kv-g" barColor="var(--green)" />
        <KpiCard icon="⚠️" label="Stock Bajo" value={kpis.bajo} tone="kv-a" barColor="var(--amber)" />
        <KpiCard icon="🔴" label="Sin Stock" value={kpis.sinStock} tone="kv-r" barColor="var(--red)" />
        <KpiCard
          icon="💰"
          label="Consumo Turno"
          value={helpers.formatMoney(kpis.consumoTurno)}
          tone="kv-t"
          barColor="var(--teal)"
        />
        <KpiCard
          icon="🛒"
          label="Venta Diaria Caja"
          value={helpers.formatMoney(kpis.ventaDiaria)}
          tone="kv-g"
          barColor="var(--green)"
          onClick={onOpenPos}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
        <div className="card">
          <div className="fbar">
            <div className="sr">
              <span className="sr-ic">🔍</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar paciente, cama, medicamento..."
              />
            </div>
            <button className="btn btn-green btn-sm" onClick={onDispatchAll}>
              ✅ Despachar Todo
            </button>
          </div>

          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cama</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Medicamento</th>
                  <th>Conc.</th>
                  <th>Dosis</th>
                  <th>Frec.</th>
                  <th>Cant.</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: 24, color: "var(--dim)" }}>
                      Sin pedidos pendientes
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.pedidoId}>
                      <td className="nc">{order.cama || "—"}</td>
                      <td>{order.paciente || "Paciente"}</td>
                      <td className="dc">{order.medico || "—"}</td>
                      <td>
                        <div className="nc">{order.nom || order.med || "Medicamento"}</div>
                        {order.solicitudFarmacia ? (
                          <span className="tag t-pend" style={{ marginTop: 4 }}>
                            🔎 Buscar en farmacia
                          </span>
                        ) : null}
                      </td>
                      <td className="mc">{order.conc || "—"}</td>
                      <td className="mc">{order.dosis || "—"}</td>
                      <td className="dc">{order.frec || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "var(--teal2)" }}>
                        {order.farmUnidades || order.cant || 1}
                      </td>
                      <td>
                        <div className="mc" style={{ fontSize: ".68rem" }}>
                          {order.hora || "--:--"}
                        </div>
                        <div className="dc" style={{ fontSize: ".64rem" }}>
                          {order.bodega || "Farmacia Central"}
                        </div>
                      </td>
                      <td>
                        {order.status === "despachada" ? (
                          <span className="tag t-desp">✅ Despachado</span>
                        ) : order.urgente ? (
                          <span className="tag t-urg">🚨 URGENTE</span>
                        ) : (
                          <span className="tag t-pend">⏳ Pendiente</span>
                        )}
                      </td>
                      <td className="acts">
                        {order.status !== "despachada" ? (
                          <button className="ia ok" title="Despachar" onClick={() => onDispatchOrder(order)}>
                            ✅
                          </button>
                        ) : (
                          <button className="ia ok" title="Despachado">
                            ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card">
            <div className="ch">
              <span className="ch-t">⚠️ Stock Crítico</span>
            </div>
            <div className="cbody">
              {criticalInventory.length === 0 ? (
                <div className="dc">Sin alertas de stock.</div>
              ) : (
                criticalInventory.slice(0, 8).map((item) => {
                  const stock = helpers.stockTotal(item);
                  const tone = stock <= 0 ? "var(--red)" : "var(--amber)";
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        marginBottom: 8,
                        background: "#fff",
                      }}
                    >
                      <div className="nc">{item.nombre}</div>
                      <div className="dc" style={{ marginTop: 2 }}>
                        {item.concentracion || "—"} · {item.bodega || "—"}
                      </div>
                      <div className="sb" style={{ marginTop: 6 }}>
                        <div className="sb-bar">
                          <div
                            className="sb-fill"
                            style={{
                              width: `${Math.min(100, item.min ? (stock / item.min) * 100 : 100)}%`,
                              background: tone,
                            }}
                          />
                        </div>
                        <span className="sb-v" style={{ color: tone }}>
                          {stock}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
