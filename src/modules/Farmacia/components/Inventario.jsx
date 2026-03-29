function InventoryRow({ item, type, helpers, onRestock }) {
  const stock = helpers.stockTotal(item);
  const lotes = helpers.lotesSummary(item);
  const nearestLot = helpers.loteMasProximo(item);
  const tone = helpers.getStockTone(item);
  const toneColor =
    tone === "crit" ? "var(--red)" : tone === "bajo" ? "var(--amber)" : "var(--green)";

  return (
    <tr>
      <td className="mc">{item.codigo}</td>
      <td>
        <div className="nc">{item.nombre}</div>
        {type.key !== "med" && item.talla ? <div className="dc">{item.talla}</div> : null}
      </td>
      {type.key === "med" ? <td>{item.concentracion || "—"}</td> : null}
      {type.key === "imp" ? <td>{item.talla || "—"}</td> : null}
      {type.key === "imp" || type.key === "equ" ? <td>{item.serie || "—"}</td> : null}
      <td style={{ textAlign: "center", fontWeight: 700, color: toneColor }}>{stock}</td>
      <td>{item.min || 0}</td>
      <td>
        {tone === "crit" ? (
          <span className="tag t-crit">SIN STOCK</span>
        ) : tone === "bajo" ? (
          <span className="tag t-bajo">BAJO</span>
        ) : (
          <span className="tag t-ok">OK</span>
        )}
      </td>
      <td className="pc-g">{helpers.formatMoney(helpers.costUnitario(item))}</td>
      <td>{item.bodega || "—"}</td>
      {type.key !== "equ" ? <td style={{ fontSize: ".64rem" }}>{lotes}</td> : null}
      <td>{nearestLot?.venc ? nearestLot.venc.slice(0, 10) : "—"}</td>
      <td>
        <div className="acts">
          <button className="ia" title="Aumentar stock" onClick={() => onRestock(item)}>
            +
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Inventario({
  inventoryTypes,
  inventoryByType,
  search,
  onSearchChange,
  inventoryFilter,
  onChangeFilter,
  onOpenNewItem,
  onOpenRestock,
  helpers,
}) {
  return (
    <section id="sec-inv" className="sec on">
      <div className="fbar">
        <div className="sr">
          <span className="sr-ic">🔍</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar en todo el inventario..."
          />
        </div>

        {[
          { key: "todos", label: "Todos" },
          { key: "bajo", label: "⚠️ Stock Bajo" },
          { key: "crit", label: "🔴 Sin Stock" },
        ].map((filter) => (
          <button
            key={filter.key}
            className="btn btn-ghost"
            style={{
              background: inventoryFilter === filter.key ? "var(--teal3)" : "var(--bg4)",
              color: inventoryFilter === filter.key ? "var(--teal2)" : "var(--muted)",
              border: "1px solid var(--border)",
            }}
            onClick={() => onChangeFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}

        <div className="fsp" />
        <button className="btn btn-teal btn-sm" onClick={onOpenNewItem}>
          + Med / Insumo / Implante
        </button>
      </div>

      {inventoryTypes.map((type) => {
        const items = inventoryByType[type.key] || [];
        return (
          <div className="card" style={{ marginBottom: 12 }} key={type.key}>
            <div className="ch" style={{ background: `linear-gradient(135deg,${type.accent},${type.accent})` }}>
              <span className="ch-t">
                {type.icon} {type.label}
              </span>
              <span className="ch-b">{items.length}</span>
            </div>

            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>{type.key === "med" ? "Medicamento" : "Item"}</th>
                    {type.key === "med" ? <th>Concentración</th> : null}
                    {type.key === "imp" ? <th>Talla</th> : null}
                    {type.key === "imp" || type.key === "equ" ? <th>N° Serie</th> : null}
                    <th>Stock</th>
                    <th>Mín.</th>
                    <th>Nivel</th>
                    <th>Precio</th>
                    <th>Bodega</th>
                    {type.key !== "equ" ? <th>Lotes</th> : null}
                    <th>Venc.</th>
                    <th>Acc.</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center", padding: 20, color: "var(--dim)" }}>
                        Sin items para este grupo
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <InventoryRow
                        key={item.id}
                        item={item}
                        type={type}
                        helpers={helpers}
                        onRestock={onOpenRestock}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
