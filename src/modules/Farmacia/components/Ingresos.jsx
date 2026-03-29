export default function Ingresos({
  ingresos,
  ingresoForm,
  onIngresoFormChange,
  onLookupCode,
  onRegisterIngreso,
  bodegas,
}) {
  return (
    <section id="sec-ing" className="sec on">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
        <div className="card">
          <div className="ch">
            <span className="ch-t">📥 Historial de Ingresos</span>
          </div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Lote</th>
                  <th>Proveedor</th>
                  <th>Bodega</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "var(--dim)" }}>
                      Sin ingresos registrados
                    </td>
                  </tr>
                ) : (
                  ingresos.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.fechaHora ? new Date(entry.fechaHora).toLocaleString("es-EC", { hour12: false }) : "—"}</td>
                      <td>{entry.item || entry.medicamento || "Item"}</td>
                      <td>{entry.cantidad || entry.cant || 0}</td>
                      <td>${Number(entry.precio || 0).toFixed(2)}</td>
                      <td>{entry.lote || "—"}</td>
                      <td>{entry.proveedor || "—"}</td>
                      <td>{entry.bodega || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <span className="ch-t">📷 Registrar Ingreso</span>
          </div>
          <div className="cbody">
            <div className="scan-box" onClick={onLookupCode}>
              <div style={{ fontSize: "1.8rem", marginBottom: 5 }}>📷</div>
              <div style={{ fontSize: ".76rem", fontWeight: 600, color: "var(--navy)" }}>
                Buscar por código
              </div>
              <div style={{ fontSize: ".66rem", color: "var(--muted)", marginTop: 2 }}>
                Ingrese el código y haga clic para autocompletar
              </div>
              <input
                className="fi fm"
                placeholder="Código del producto..."
                value={ingresoForm.codigo}
                onChange={(event) => onIngresoFormChange("codigo", event.target.value)}
                style={{ marginTop: 8 }}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onLookupCode();
                }}
              />
            </div>

            <div className="dv" />

            <div className="g2" style={{ marginBottom: 7 }}>
              <div className="fg">
                <label className="fl">Tipo de Ítem</label>
                <select
                  className="fs"
                  value={ingresoForm.tipo}
                  onChange={(event) => onIngresoFormChange("tipo", event.target.value)}
                >
                  <option value="med">💊 Medicamento</option>
                  <option value="ins">🩺 Insumo</option>
                  <option value="imp">🦴 Implante</option>
                  <option value="equ">⚙️ Equipamiento</option>
                </select>
              </div>

              <div className="fg">
                <label className="fl">Nombre / Item *</label>
                <input
                  className="fi"
                  value={ingresoForm.nombre}
                  onChange={(event) => onIngresoFormChange("nombre", event.target.value)}
                  placeholder="Nombre..."
                />
              </div>

              <div className="fg">
                <label className="fl">Cantidad *</label>
                <input
                  className="fi fm"
                  type="number"
                  min="1"
                  value={ingresoForm.cantidad}
                  onChange={(event) => onIngresoFormChange("cantidad", event.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="g3" style={{ marginBottom: 7 }}>
              <div className="fg">
                <label className="fl">Concentración</label>
                <input
                  className="fi"
                  value={ingresoForm.concentracion}
                  onChange={(event) => onIngresoFormChange("concentracion", event.target.value)}
                  placeholder="500mg"
                />
              </div>
              <div className="fg">
                <label className="fl">Precio ($)</label>
                <input
                  className="fi fm"
                  type="number"
                  step="0.01"
                  value={ingresoForm.precio}
                  onChange={(event) => onIngresoFormChange("precio", event.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="fg">
                <label className="fl">Lote</label>
                <input
                  className="fi fm"
                  value={ingresoForm.lote}
                  onChange={(event) => onIngresoFormChange("lote", event.target.value)}
                  placeholder="L-2026-X"
                />
              </div>
            </div>

            <div className="g2" style={{ marginBottom: 8 }}>
              <div className="fg">
                <label className="fl">Caducidad</label>
                <input
                  className="fi"
                  type="month"
                  value={ingresoForm.venc}
                  onChange={(event) => onIngresoFormChange("venc", event.target.value)}
                />
              </div>
              <div className="fg">
                <label className="fl">Bodega Destino</label>
                <select
                  className="fs"
                  value={ingresoForm.bodega}
                  onChange={(event) => onIngresoFormChange("bodega", event.target.value)}
                >
                  {bodegas.map((bodega) => (
                    <option key={bodega}>{bodega}</option>
                  ))}
                </select>
              </div>
            </div>

            {ingresoForm.tipo === "equ" ? (
              <div className="fg" style={{ marginBottom: 8 }}>
                <label className="fl" style={{ color: "var(--red)" }}>
                  N° de Serie *
                </label>
                <input
                  className="fi fm"
                  value={ingresoForm.serie}
                  onChange={(event) => onIngresoFormChange("serie", event.target.value)}
                  placeholder="SN-00001"
                  style={{ borderColor: "var(--red)" }}
                />
              </div>
            ) : null}

            <div className="fg" style={{ marginBottom: 8 }}>
              <label className="fl">Proveedor</label>
              <input
                className="fi"
                value={ingresoForm.proveedor}
                onChange={(event) => onIngresoFormChange("proveedor", event.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>

            <button className="btn btn-teal" style={{ width: "100%" }} onClick={onRegisterIngreso}>
              📥 Registrar Ingreso
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
