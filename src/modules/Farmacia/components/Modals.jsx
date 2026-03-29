export default function Modals({
  newItemOpen,
  onCloseNewItem,
  newItemForm,
  onNewItemFormChange,
  onCreateNewItem,
  restockTarget,
  restockForm,
  onRestockFormChange,
  onCloseRestock,
  onConfirmRestock,
  helpers,
  bodegas,
}) {
  return (
    <>
      <div className={`ov ${newItemOpen ? "on" : ""}`} onClick={onCloseNewItem}>
        <div className="modal w" onClick={(event) => event.stopPropagation()}>
          <div className="mh">
            <span className="mt">+ Med / Insumo / Implante</span>
            <button className="mx" onClick={onCloseNewItem}>
              ✕
            </button>
          </div>
          <div className="mb">
            <div className="g3" style={{ marginBottom: 8 }}>
              <div className="fg">
                <label className="fl">Código</label>
                <input className="fi fm" value={newItemForm.codigo} onChange={(e) => onNewItemFormChange("codigo", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Nombre</label>
                <input className="fi" value={newItemForm.nombre} onChange={(e) => onNewItemFormChange("nombre", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Concentración</label>
                <input className="fi" value={newItemForm.concentracion} onChange={(e) => onNewItemFormChange("concentracion", e.target.value)} />
              </div>
            </div>

            <div className="g3" style={{ marginBottom: 8 }}>
              <div className="fg">
                <label className="fl">Tipo</label>
                <select className="fs" value={newItemForm.tipo} onChange={(e) => onNewItemFormChange("tipo", e.target.value)}>
                  <option value="med">Medicamento</option>
                  <option value="ins">Insumo</option>
                  <option value="imp">Implante</option>
                  <option value="equ">Equipamiento</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Mínimo</label>
                <input className="fi fm" type="number" value={newItemForm.minimo} onChange={(e) => onNewItemFormChange("minimo", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Bodega</label>
                <select className="fs" value={newItemForm.bodega} onChange={(e) => onNewItemFormChange("bodega", e.target.value)}>
                  {bodegas.map((bodega) => (
                    <option key={bodega}>{bodega}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="g3" style={{ marginBottom: 8 }}>
              <div className="fg">
                <label className="fl">Stock Inicial</label>
                <input className="fi fm" type="number" value={newItemForm.stock} onChange={(e) => onNewItemFormChange("stock", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Precio</label>
                <input className="fi fm" type="number" step="0.01" value={newItemForm.precio} onChange={(e) => onNewItemFormChange("precio", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Lote</label>
                <input className="fi fm" value={newItemForm.lote} onChange={(e) => onNewItemFormChange("lote", e.target.value)} />
              </div>
            </div>

            <div className="g3">
              <div className="fg">
                <label className="fl">Caducidad</label>
                <input className="fi" type="month" value={newItemForm.venc} onChange={(e) => onNewItemFormChange("venc", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Talla</label>
                <input className="fi" value={newItemForm.talla} onChange={(e) => onNewItemFormChange("talla", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Serie</label>
                <input className="fi fm" value={newItemForm.serie} onChange={(e) => onNewItemFormChange("serie", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="mf">
            <button className="btn" style={{ background: "var(--bg4)", color: "var(--muted)", border: "1px solid var(--border)" }} onClick={onCloseNewItem}>
              Cancelar
            </button>
            <button className="btn btn-teal" onClick={onCreateNewItem}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      <div className={`ov ${restockTarget ? "on" : ""}`} onClick={onCloseRestock}>
        <div className="modal sm" onClick={(event) => event.stopPropagation()}>
          <div className="mh">
            <span className="mt">+ Aumentar Stock</span>
            <button className="mx" onClick={onCloseRestock}>
              ✕
            </button>
          </div>
          <div className="mb">
            {restockTarget ? (
              <>
                <div
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 9,
                    padding: "11px 13px",
                    marginBottom: 12,
                    fontSize: ".82rem",
                  }}
                >
                  <div className="nc">{restockTarget.nombre}</div>
                  <div className="dc" style={{ marginTop: 4 }}>
                    {restockTarget.bodega} · {restockTarget.concentracion || "—"}
                  </div>
                  <div className="dc" style={{ marginTop: 4 }}>
                    Stock actual: {helpers.stockTotal(restockTarget)} · Mínimo: {restockTarget.min || 0}
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <input
                      type="radio"
                      checked={restockForm.modo === "mismo"}
                      onChange={() => onRestockFormChange("modo", "mismo")}
                    />
                    <span>Usar lote existente</span>
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={restockForm.modo === "nuevo"}
                      onChange={() => onRestockFormChange("modo", "nuevo")}
                    />
                    <span>Crear lote nuevo</span>
                  </label>
                </div>

                {restockForm.modo === "mismo" ? (
                  <div className="fg" style={{ marginBottom: 10 }}>
                    <label className="fl">Lote existente</label>
                    <select
                      className="fs fm"
                      value={restockForm.loteExistente}
                      onChange={(event) => onRestockFormChange("loteExistente", event.target.value)}
                    >
                      {(restockTarget.lotes || []).map((lote) => (
                        <option key={lote.idLote} value={lote.idLote}>
                          {lote.idLote} — {lote.stock} ud · vto {lote.venc?.slice(0, 7) || "—"}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="g2" style={{ marginBottom: 10 }}>
                    <div className="fg">
                      <label className="fl">ID del Nuevo Lote</label>
                      <input className="fi fm" value={restockForm.loteNuevo} onChange={(e) => onRestockFormChange("loteNuevo", e.target.value)} />
                    </div>
                    <div className="fg">
                      <label className="fl">Caducidad</label>
                      <input className="fi" type="month" value={restockForm.vencNuevo} onChange={(e) => onRestockFormChange("vencNuevo", e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="g2">
                  <div className="fg">
                    <label className="fl">Precio Unit.</label>
                    <input className="fi fm" type="number" step="0.01" value={restockForm.precioNuevo} onChange={(e) => onRestockFormChange("precioNuevo", e.target.value)} />
                  </div>
                  <div className="fg">
                    <label className="fl">Cantidad</label>
                    <input className="fi fm" type="number" min="1" value={restockForm.cantidad} onChange={(e) => onRestockFormChange("cantidad", e.target.value)} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div className="mf">
            <button className="btn" style={{ background: "var(--bg4)", color: "var(--muted)", border: "1px solid var(--border)" }} onClick={onCloseRestock}>
              Cancelar
            </button>
            <button className="btn btn-teal" onClick={onConfirmRestock}>
              📥 Confirmar Ingreso
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
