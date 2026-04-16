import React from "react";
import KpiStrip from "./KpiStrip";

const tagClass = (active) => `admin-tag ${active ? "tag-success" : "tag-danger"}`;

const TarifaCategoria = ({ label, color }) => (
  <span
    className="admin-tag"
    style={{
      color,
      background: `${color}18`,
      borderColor: `${color}30`,
    }}
  >
    {label}
  </span>
);

const TarifarioSection = ({ panel }) => {
  const { cargoColors, authLabels, areaOptions } = panel.constants;
  const areaLabel = (value) => areaOptions.find((item) => item.value === value)?.label || value;

  return (
    <section>
      <KpiStrip items={panel.kpis} />

      <div className="admin-card">
        <div className="admin-card-header ch-navy">
          <span>💲</span>
          <span className="admin-card-title">Administracion de Servicios</span>
          <span className="admin-card-badge">
            {panel.serviciosTarifario.length} servicios
          </span>
          <div className="admin-spacer" />
          <button type="button" className="btn btn-white" onClick={() => panel.openTarifaModal()}>
            ✏ Nuevo Servicio
          </button>
          <button type="button" className="btn btn-white" onClick={() => panel.openCargoModal()}>
            ➕ Nuevo Cargo
          </button>
          <button type="button" className="btn btn-white" onClick={panel.exportTarifario}>
            ⬇ Exportar
          </button>
        </div>

        <div className="admin-muted-bar">
          Cada modificacion queda registrada en el Log de Auditoria con usuario, justificacion y
          timestamp. Acciones irreversibles requieren rol Gerencia.
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Codigo / Tipo</th>
                <th>Servicio / Descripcion</th>
                <th>Categoria</th>
                <th>Tarifa</th>
                <th>Anterior</th>
                <th>Ultimo Cambio</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {panel.serviciosTarifario.map((item) => {
                const color = cargoColors[item.cat] || "#1a3a5c";
                const activo = item.activo !== false;
                return (
                  <tr key={`${item._tipo}-${item.key}`} style={{ opacity: activo ? 1 : 0.55 }}>
                    <td>
                      <div className="admin-code">{item.cod}</div>
                      <div style={{ marginTop: 4 }}>
                        <span className={`admin-tag ${item._tipo === "cargo" ? "tag-success" : "tag-info"}`}>
                          {item._tipo === "cargo" ? "Personalizado" : "Base"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-name">{item.label}</div>
                      {item.notas ? <div className="admin-subtext">{item.notas}</div> : null}
                    </td>
                    <td>
                      <TarifaCategoria label={item.cat} color={color} />
                    </td>
                    <td>
                      <span className="admin-money">{item.valor === 0 ? "Sin cargo" : `$${item.valor.toFixed(2)}`}</span>
                    </td>
                    <td className="admin-subtext">
                      {item.anterior != null ? `$${Number(item.anterior).toFixed(2)}` : "-"}
                    </td>
                    <td className="admin-subtext">
                      {item.ultimoCambio ? (
                        <>
                          {item.ultimoCambio}
                          <br />
                          <strong>{item.usuario || "-"}</strong>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <span className={tagClass(activo)}>{activo ? "Activo" : "Inactivo"}</span>
                    </td>
                    <td>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() =>
                            item._tipo === "base"
                              ? panel.openTarifaModal(item)
                              : panel.openCargoModal(item)
                          }
                        >
                          ✏
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() => panel.toggleServicio(item.key, item._tipo)}
                        >
                          {activo ? "⏸" : "▶"}
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          style={{
                            color: "var(--pa-red)",
                            background: "rgba(197,48,48,.08)",
                            borderColor: "rgba(197,48,48,.16)",
                          }}
                          onClick={() => panel.eliminarServicio(item.key, item._tipo)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-note-title">➕ Cargos Personalizados del Establecimiento</div>
      <KpiStrip items={panel.cargosKpis} />

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header ch-navy">
            <span>➕</span>
            <span className="admin-card-title">Catalogo de Cargos</span>
            <span className="admin-card-badge">
              {panel.adminData.cargosPersonalizados.length} cargos
            </span>
            <div className="admin-spacer" />
            <div className="admin-search-row">
              <input
                className="fi"
                style={{ minWidth: 180 }}
                placeholder="Buscar cargo..."
                value={panel.cargoFilters.search}
                onChange={(event) =>
                  panel.setCargoFilters((prev) => ({ ...prev, search: event.target.value }))
                }
              />
              <select
                className="fs"
                value={panel.cargoFilters.category}
                onChange={(event) =>
                  panel.setCargoFilters((prev) => ({ ...prev, category: event.target.value }))
                }
              >
                <option value="">Todas las categorias</option>
                {panel.constants.cargoCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="fs"
                value={panel.cargoFilters.status}
                onChange={(event) =>
                  panel.setCargoFilters((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              <button type="button" className="btn btn-white" onClick={panel.exportCargos}>
                ⬇
              </button>
            </div>
          </div>

          <div className="admin-table-wrap" style={{ maxHeight: 360 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Cargo</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Unidad</th>
                  <th>IVA</th>
                  <th>Autorizacion</th>
                  <th>Estado</th>
                  <th>Areas</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {panel.cargosFiltrados.length ? (
                  panel.cargosFiltrados.map((item) => {
                    const color = cargoColors[item.cat] || "#5a7a96";
                    return (
                      <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.55 }}>
                        <td className="admin-code">{item.cod}</td>
                        <td>
                          <div className="admin-name">{item.nom}</div>
                          {item.desc ? <div className="admin-subtext">{item.desc}</div> : null}
                        </td>
                        <td>
                          <TarifaCategoria label={item.cat} color={color} />
                        </td>
                        <td className="admin-money">${item.valor.toFixed(2)}</td>
                        <td className="admin-subtext">{item.unidad}</td>
                        <td className="admin-subtext">{item.iva === "si" ? "Con IVA 15%" : "Exento"}</td>
                        <td>
                          <span className="admin-tag tag-warning">{authLabels[item.auth] || item.auth}</span>
                        </td>
                        <td>
                          <span className={tagClass(item.activo)}>{item.activo ? "Activo" : "Inactivo"}</span>
                        </td>
                        <td>
                          <div className="admin-inline-actions">
                            {(item.areas || []).map((area) => (
                              <span key={`${item.id}-${area}`} className="admin-tag tag-info">
                                {areaLabel(area)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="admin-inline-actions">
                            <button
                              type="button"
                              className="admin-mini-btn"
                              onClick={() => panel.openCargoModal(item)}
                            >
                              ✏
                            </button>
                            <button
                              type="button"
                              className="admin-mini-btn"
                              onClick={() => panel.toggleCargo(item.id)}
                            >
                              {item.activo ? "🔒" : "🔓"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="admin-empty">
                      Sin cargos que coincidan con el filtro
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-side-stack">
          <div className="admin-card">
            <div className="admin-card-header ch-teal">
              <span>🏥</span>
              <span className="admin-card-title">Por Area</span>
            </div>
            <div className="admin-card-body admin-summary-list">
              {panel.cargosPanels.areas.length ? (
                panel.cargosPanels.areas.map((item) => (
                  <div key={item.area} className="admin-summary-row">
                    <span>{areaLabel(item.area)}</span>
                    <strong>{item.total}</strong>
                  </div>
                ))
              ) : (
                <div className="admin-empty">Sin cargos activos</div>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header ch-gold">
              <span>📊</span>
              <span className="admin-card-title">Resumen</span>
            </div>
            <div className="admin-card-body">
              <div className="admin-form-grid-2">
                <div className="admin-erp-box">
                  <div className="admin-erp-box-title">Activos</div>
                  <div className="admin-money">{panel.cargosPanels.resumen.activos}</div>
                </div>
                <div className="admin-erp-box">
                  <div className="admin-erp-box-title">Inactivos</div>
                  <div className="admin-money" style={{ color: "var(--pa-red)" }}>
                    {panel.cargosPanels.resumen.inactivos}
                  </div>
                </div>
              </div>
              <div className="admin-summary-list" style={{ marginTop: 12 }}>
                {panel.cargosPanels.resumen.categorias.map((item) => (
                  <div key={item.categoria} className="admin-summary-row">
                    <span>{item.categoria}</span>
                    <strong>{item.total}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header ch-navy">
              <span>🔐</span>
              <span className="admin-card-title">Autorizacion</span>
            </div>
            <div className="admin-card-body admin-summary-list">
              {panel.cargosPanels.autorizacion.map((item) => (
                <div key={item.key} className="admin-summary-row">
                  <span>{item.label}</span>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TarifarioSection;

