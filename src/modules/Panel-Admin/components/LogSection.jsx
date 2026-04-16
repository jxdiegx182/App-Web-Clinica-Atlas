import React from "react";

const LogSection = ({ panel }) => (
  <section>
    <div className="admin-card">
      <div className="admin-card-header ch-red">
        <span>📜</span>
        <span className="admin-card-title">Log de Auditoria - Registro Inmutable</span>
        <span className="admin-card-badge">{panel.adminData.log.length} registros</span>
        <div className="admin-spacer" />
        <button type="button" className="btn btn-white" onClick={panel.exportLog}>
          ⬇ Exportar CSV Legal
        </button>
      </div>

      <div className="admin-card-body">
        <div className="admin-search-row">
          <input
            className="fi"
            placeholder="Filtrar log por usuario, accion..."
            value={panel.logFilters.search}
            onChange={(event) =>
              panel.setLogFilters((prev) => ({ ...prev, search: event.target.value }))
            }
          />
          <select
            className="fs"
            value={panel.logFilters.type}
            onChange={(event) =>
              panel.setLogFilters((prev) => ({ ...prev, type: event.target.value }))
            }
          >
            <option value="">Todos los tipos</option>
            <option value="tarifa">Cambios de Tarifa</option>
            <option value="convenio">Convenios</option>
            <option value="sync">Sincronizaciones</option>
            <option value="acceso">Accesos</option>
            <option value="cargo">Cargos</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Accion</th>
              <th>Valor Anterior</th>
              <th>Valor Nuevo</th>
              <th>Justificacion</th>
            </tr>
          </thead>
          <tbody>
            {panel.logsFiltrados.map((item, index) => (
              <tr key={`${item.fecha}-${index}`}>
                <td className="admin-code">{item.fecha}</td>
                <td className="admin-name">{item.usuario || "-"}</td>
                <td>
                  <span className="admin-tag tag-success">{item.rol || "-"}</span>
                </td>
                <td>{item.accion}</td>
                <td style={{ color: "var(--pa-red)" }}>{item.antes || "-"}</td>
                <td style={{ color: "var(--pa-teal)" }}>{item.ahora || "-"}</td>
                <td className="admin-subtext">{item.justif || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default LogSection;
