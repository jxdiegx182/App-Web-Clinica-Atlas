import React from "react";

const ConveniosSection = ({ panel }) => (
  <section>
    <div className="admin-card">
      <div className="admin-card-header ch-blue">
        <span>🤝</span>
        <span className="admin-card-title">Convenios y Seguros Medicos</span>
        <span className="admin-card-badge">Ajuste automatico de tarifas</span>
        <div className="admin-spacer" />
        <button type="button" className="btn btn-white" onClick={panel.openConvenioNewModal}>
          + Nuevo Convenio
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Convenio</th>
              <th>Tipo Tarifa</th>
              <th>% Ajuste</th>
              <th>IVA</th>
              <th>Tarifario Nacional</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {panel.convenios.map((item) => {
              const pctColor = item.pct < 0 ? "var(--pa-teal)" : item.pct > 0 ? "var(--pa-red)" : "var(--pa-muted)";
              const pctLabel =
                item.pct === 0
                  ? "Sin ajuste"
                  : item.pct === -100
                    ? "Gratuito"
                    : item.pct < 0
                      ? `${item.pct}% Desc.`
                      : `+${item.pct}% Rec.`;
              return (
                <tr key={item.id}>
                  <td className="admin-name">{item.nombre}</td>
                  <td>
                    <span className="admin-tag tag-success">Tarifa {item.tipo}</span>
                  </td>
                  <td style={{ color: pctColor, fontWeight: 800 }}>{pctLabel}</td>
                  <td className="admin-subtext">{item.iva === "si" ? "Con IVA 15%" : "Exento IVA"}</td>
                  <td className="admin-subtext">{item.tipo === "B" ? "✔ Tarifario Nacional" : "-"}</td>
                  <td>
                    <span className={`admin-tag ${item.activo ? "tag-success" : "tag-danger"}`}>
                      {item.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="admin-mini-btn" onClick={() => panel.openConvenioEditModal(item)}>
                      ✏ Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="admin-card">
      <div className="admin-card-header ch-teal">
        <span>📋</span>
        <span className="admin-card-title">Simulador de Tarifa por Convenio</span>
      </div>
      <div className="admin-card-body">
        <div className="admin-form-grid-3">
          <div className="fg">
            <label className="fl">Servicio</label>
            <select
              className="fs"
              value={panel.simulator.servicio}
              onChange={(event) =>
                panel.setSimulator((prev) => ({ ...prev, servicio: event.target.value }))
              }
            >
              <option value="">Seleccione servicio...</option>
              {panel.adminData.tarifario.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} (${item.valor.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label className="fl">Convenio</label>
            <select
              className="fs"
              value={panel.simulator.convenio}
              onChange={(event) =>
                panel.setSimulator((prev) => ({ ...prev, convenio: event.target.value }))
              }
            >
              <option value="">Seleccione convenio...</option>
              {panel.convenios
                .filter((item) => item.activo)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
            </select>
          </div>

          <div className="admin-erp-box" style={{ textAlign: "center" }}>
            <div className="admin-erp-box-title">Total a Cobrar</div>
            <div className="admin-money" style={{ fontSize: "1.4rem" }}>
              {panel.simuladorResultado.total}
            </div>
            <div className="admin-subtext">{panel.simuladorResultado.detalle}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ConveniosSection;
