import React from "react";

const ColaSection = ({ panel }) => (
  <section>
    <div className="admin-card">
      <div className="admin-card-header ch-gold">
        <span>🔄</span>
        <span className="admin-card-title">Cola de Sincronizacion → ERP</span>
        <span className="admin-card-badge">
          {panel.cola.filter((item) => item.estado === "PENDIENTE").length} pendientes
        </span>
        <div className="admin-spacer" />
        <button type="button" className="btn btn-white" onClick={panel.sincronizarTodo}>
          ✅ Autorizar y Sincronizar
        </button>
        <button type="button" className="btn btn-white" onClick={panel.enviarERP}>
          🔗 Enviar a ERP
        </button>
        <button type="button" className="btn btn-white" onClick={() => panel.exportarLoteFacturacion()}>
          📦 Lote JSON
        </button>
        <button type="button" className="btn btn-white" onClick={panel.exportCola}>
          ⬇ CSV
        </button>
      </div>

      <div className="admin-erp-bar">
        <div
          className="admin-erp-dot"
          style={{
            background: panel.currentErpStatus.color,
            boxShadow: `0 0 8px ${panel.currentErpStatus.color}`,
          }}
        />
        <strong style={{ color: panel.currentErpStatus.color }}>{panel.currentErpStatus.text}</strong>
        <span className="admin-spacer" />
        <span className="admin-subtext">Ultima sincronizacion: {panel.erpState.lastSync}</span>
        <span className="admin-subtext">Lote activo: {panel.erpState.loteId}</span>
      </div>

      {panel.erpState.visible && panel.erpState.payload ? (
        <div className="admin-erp-preview">
          <div className="admin-erp-preview-grid">
            <div className="admin-erp-box">
              <div className="admin-erp-box-title">ID Transaccion</div>
              <div className="admin-code">{panel.erpState.payload.meta.transaccion_id}</div>
            </div>
            <div className="admin-erp-box">
              <div className="admin-erp-box-title">Items en Lote</div>
              <div className="admin-money">{panel.erpState.payload.meta.total_items}</div>
            </div>
            <div className="admin-erp-box">
              <div className="admin-erp-box-title">Monto Total Lote</div>
              <div className="admin-money">${panel.erpState.payload.meta.monto_total.toFixed(2)}</div>
            </div>
          </div>
          <div className="admin-erp-box">
            <div className="admin-erp-box-title">Preview JSON - Payload ERP</div>
            <pre className="admin-erp-pre">
              {JSON.stringify(panel.erpState.payload, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="admin-table-wrap" style={{ maxHeight: "calc(100vh - 340px)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Modulo</th>
              <th>Concepto</th>
              <th>Paciente / Cliente</th>
              <th>Area / Bodega</th>
              <th>Monto</th>
              <th>Lote</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {panel.cola.map((item, index) => (
              <tr key={`${item.fecha}-${index}`} style={{ opacity: item.estado === "SINCRONIZADO" ? 0.58 : 1 }}>
                <td className="admin-code">{item.fecha}</td>
                <td>
                  <span className="admin-tag tag-success">{item.modulo}</span>
                </td>
                <td className="admin-name">{item.concepto}</td>
                <td className="admin-subtext">{item.paciente}</td>
                <td className="admin-code">{item.area}</td>
                <td className="admin-money">${item.monto.toFixed(2)}</td>
                <td className="admin-code">{item.lote || "-"}</td>
                <td>
                  {item.estado === "SINCRONIZADO" ? (
                    <div className="admin-inline-actions">
                      <span className="admin-tag tag-success">✔ Sync</span>
                      {item.isLocked ? <span className="admin-tag tag-info">🔒 Bloqueado</span> : null}
                    </div>
                  ) : (
                    <span className="admin-tag tag-warning">⏳ Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default ColaSection;

