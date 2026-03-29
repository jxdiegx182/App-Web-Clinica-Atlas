export default function Ventas({
  search,
  onSearchChange,
  matches,
  cart,
  helpers,
  posForm,
  paymentOptions,
  onPosFormChange,
  onAddCartItem,
  onChangeCartQty,
  onFinalizeSale,
  onCancelSale,
  totalSales,
  totalSalesCount,
  saleReceiptCounter,
}) {
  const subtotal = cart.reduce((acc, item) => acc + item.pvp * item.cant, 0);
  const iva = cart.reduce(
    (acc, item) => acc + (item.aplicaIva ? item.pvp * item.cant * 0.15 : 0),
    0
  );
  const total = subtotal + iva;

  return (
    <section id="sec-pos" className="sec on">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card">
            <div className="ch" style={{ background: "linear-gradient(135deg,var(--green),#1a5c3a)" }}>
              <span className="ch-t">🛒 Punto de Venta — Farmacia</span>
              <span className="ch-b" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>
                {cart.length} items
              </span>
            </div>
            <div className="cbody">
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div className="sr">
                  <span className="sr-ic">🔍</span>
                  <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar producto por nombre o código"
                  />
                </div>
              </div>

              {matches.length > 0 ? (
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                  {matches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onAddCartItem(item)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: ".78rem",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{item.nombre}</div>
                        <div style={{ color: "var(--muted)", fontSize: ".68rem" }}>
                          {item.codigo} · {item.bodega}
                        </div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800 }}>
                        {helpers.stockTotal(item)} ud
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="tw">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Bodega</th>
                      <th>Lote</th>
                      <th>Cant.</th>
                      <th>PVP</th>
                      <th>IVA</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: 20, color: "var(--dim)" }}>
                          Carrito vacío
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => {
                        const subtotalItem = item.pvp * item.cant;
                        const ivaItem = item.aplicaIva ? subtotalItem * 0.15 : 0;
                        const totalItem = subtotalItem + ivaItem;
                        return (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--navy)" }}>{item.nombre}</div>
                              <div style={{ fontSize: ".64rem", color: "var(--muted)" }}>
                                {item.tipo === "med" ? "Medicamento" : "Item con IVA"}
                              </div>
                            </td>
                            <td className="dc">{item.bodega}</td>
                            <td className="mc">{item.lote}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <button className="ia" onClick={() => onChangeCartQty(item.id, -1)}>
                                  −
                                </button>
                                <span style={{ minWidth: 20, textAlign: "center", fontWeight: 800 }}>{item.cant}</span>
                                <button className="ia ok" onClick={() => onChangeCartQty(item.id, 1)}>
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="pc-g">{helpers.formatMoney(item.pvp)}</td>
                            <td>{item.aplicaIva ? helpers.formatMoney(ivaItem) : "Exento"}</td>
                            <td style={{ fontWeight: 800, color: "var(--green)" }}>
                              {helpers.formatMoney(totalItem)}
                            </td>
                            <td>
                              <button className="ia del" onClick={() => onChangeCartQty(item.id, -item.cant)}>
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card">
            <div className="ch" style={{ background: "linear-gradient(135deg,var(--green),#1a5c3a)" }}>
              <span className="ch-t">💳 Datos de Facturación</span>
            </div>
            <div className="cbody">
              <div className="g2" style={{ marginBottom: 8 }}>
                <div className="fg">
                  <label className="fl">Cédula</label>
                  <input
                    className="fi"
                    value={posForm.cedula}
                    onChange={(event) => onPosFormChange("cedula", event.target.value)}
                    placeholder="9999999999"
                  />
                </div>
                <div className="fg">
                  <label className="fl">Cliente</label>
                  <input
                    className="fi"
                    value={posForm.nombre}
                    onChange={(event) => onPosFormChange("nombre", event.target.value)}
                    placeholder="Consumidor Final"
                  />
                </div>
              </div>
              <div className="fg" style={{ marginBottom: 8 }}>
                <label className="fl">Dirección</label>
                <input
                  className="fi"
                  value={posForm.direccion}
                  onChange={(event) => onPosFormChange("direccion", event.target.value)}
                  placeholder="Dirección"
                />
              </div>
              <div className="fg" style={{ marginBottom: 12 }}>
                <label className="fl">Forma de Pago</label>
                <select
                  className="fs"
                  value={posForm.pago}
                  onChange={(event) => onPosFormChange("pago", event.target.value)}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>Subtotal</span>
                  <strong>{helpers.formatMoney(subtotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>IVA 15%</span>
                  <strong>{helpers.formatMoney(iva)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total</span>
                  <strong>{helpers.formatMoney(total)}</strong>
                </div>
              </div>

              <div className="mf" style={{ padding: 0, borderTop: 0, background: "transparent", marginTop: 12 }}>
                <button className="btn" style={{ background: "var(--bg4)", color: "var(--muted)", border: "1px solid var(--border)" }} onClick={onCancelSale}>
                  Cancelar
                </button>
                <button className="btn btn-teal" onClick={onFinalizeSale}>
                  Finalizar Venta
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ch">
              <span className="ch-t">📈 Resumen Caja</span>
            </div>
            <div className="cbody">
              <div className="dc">Ventas registradas: {totalSalesCount}</div>
              <div className="nc" style={{ marginTop: 4 }}>
                Total caja: {helpers.formatMoney(totalSales)}
              </div>
              <div className="dc" style={{ marginTop: 4 }}>
                Último recibo: REC-{saleReceiptCounter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
