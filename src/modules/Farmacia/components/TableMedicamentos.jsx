export default function TableMedicamentos({
  historyRows,
  search,
  onSearchChange,
  onExportCsv,
  onShowToast,
}) {
  return (
    <section id="sec-hist" className="sec on">
      <div className="fbar">
        <div className="sr">
          <span className="sr-ic">🔍</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar en historial..."
          />
        </div>

        <button className="btn btn-teal btn-sm" onClick={onExportCsv}>
          ⬇ Exportar CSV
        </button>
        <button
          className="btn btn-sm"
          style={{ background: "var(--blue2)", color: "var(--blue)", border: "1px solid rgba(49,130,206,.25)" }}
          onClick={() => onShowToast("Resumen por bodega pendiente de portarse completo", "a")}
        >
          📊 Por Bodega
        </button>
        <button
          className="btn btn-sm"
          style={{ background: "rgba(197,48,48,.1)", color: "var(--red)", border: "1px solid rgba(197,48,48,.25)" }}
          onClick={() => onShowToast("Reporte de psicotrópicos pendiente de portarse completo", "a")}
        >
          ⚠️ Psicotrópicos
        </button>
        <button
          className="btn btn-sm"
          style={{ background: "rgba(183,121,31,.1)", color: "var(--amber)", border: "1px solid rgba(183,121,31,.25)" }}
          onClick={() => onShowToast("Reporte de vencimientos pendiente de portarse completo", "a")}
        >
          📅 Vencimientos
        </button>
      </div>

      <div className="card">
        <div className="ch">
          <span className="ch-t">📋 Historial de Movimientos</span>
          <span className="ch-b">{historyRows.length}</span>
        </div>
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Tipo</th>
                <th>Item</th>
                <th>Cama / Bodega</th>
                <th>Paciente</th>
                <th>Cant.</th>
                <th>Costo Total</th>
                <th>Lote</th>
                <th>Responsable</th>
                <th>Verificación</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 20, color: "var(--dim)" }}>
                    Sin movimientos registrados
                  </td>
                </tr>
              ) : (
                historyRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.fechaHora ? new Date(row.fechaHora).toLocaleString("es-EC", { hour12: false }) : "—"}</td>
                    <td>{row.tipo || "—"}</td>
                    <td>{row.item || row.medicamento || "Item"}</td>
                    <td>{row.cama || row.bodega || "—"}</td>
                    <td>{row.paciente || "—"}</td>
                    <td>{row.cantidad || row.cant || 0}</td>
                    <td>${Number(row.costoTotal || row.total || 0).toFixed(2)}</td>
                    <td>{row.lote || "—"}</td>
                    <td>{row.responsable || row.resp || "—"}</td>
                    <td>{row.verificacion || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
