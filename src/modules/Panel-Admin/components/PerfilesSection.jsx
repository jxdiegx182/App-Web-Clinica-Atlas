import React from "react";

const PerfilesSection = ({ panel }) => (
  <section className="admin-grid-2">
    <div className="admin-card">
      <div className="admin-card-header ch-navy">
        <span>👤</span>
        <span className="admin-card-title">Personal y Usuarios del Sistema</span>
        <span className="admin-card-badge">{panel.adminData.perfiles.length} usuarios</span>
        <div className="admin-spacer" />
        <input
          className="fi"
          style={{ minWidth: 220 }}
          placeholder="Buscar usuario..."
          value={panel.profileSearch}
          onChange={(event) => panel.setProfileSearch(event.target.value)}
        />
        <button type="button" className="btn btn-white" onClick={() => panel.openPerfilModal()}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="admin-table-wrap" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Cargo</th>
              <th>Area</th>
              <th>Rol Sistema</th>
              <th>Permisos</th>
              <th>Estado</th>
              <th>Ultimo Acceso</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {panel.perfilesFiltrados.map((item) => {
              const role = panel.constants.roles[item.rol];
              return (
                <tr key={item.id}>
                  <td className="admin-code">{item.user}</td>
                  <td className="admin-name">{item.nombre}</td>
                  <td className="admin-subtext">{item.cargo}</td>
                  <td>
                    <span className="admin-tag tag-success">{item.area}</span>
                  </td>
                  <td>
                    <span
                      className="admin-tag"
                      style={{
                        color: role?.color || "#5a7a96",
                        background: `${role?.color || "#5a7a96"}18`,
                        borderColor: `${role?.color || "#5a7a96"}30`,
                      }}
                    >
                      {role?.label || item.rol}
                    </span>
                  </td>
                  <td>
                    <div className="admin-inline-actions">
                      {(role?.permisos || []).slice(0, 2).map((permiso) => (
                        <span key={`${item.id}-${permiso}`} className="admin-tag tag-info">
                          {permiso}
                        </span>
                      ))}
                      {(role?.permisos || []).length > 2 ? (
                        <span className="admin-tag tag-info">+{role.permisos.length - 2}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-tag ${item.activo ? "tag-success" : "tag-danger"}`}>
                      {item.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="admin-subtext">{item.ultimoAcceso || "-"}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button type="button" className="admin-mini-btn" onClick={() => panel.openPerfilModal(item)}>
                        ✏
                      </button>
                      <button type="button" className="admin-mini-btn" onClick={() => panel.openRoleModal(item)}>
                        🔑 Rol
                      </button>
                      <button type="button" className="admin-mini-btn" onClick={() => panel.togglePerfil(item.id)}>
                        {item.activo ? "🔒" : "🔓"}
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

    <div className="admin-side-stack">
      <div className="admin-card">
        <div className="admin-card-header ch-teal">
          <span>🔑</span>
          <span className="admin-card-title">Definicion de Roles</span>
        </div>
        <div className="admin-card-body admin-summary-list">
          {panel.rolesPanel.map((item) => (
            <div key={item.key} className="admin-summary-row" style={{ alignItems: "flex-start" }}>
              <div>
                <div
                  className="admin-tag"
                  style={{
                    color: item.color,
                    background: `${item.color}18`,
                    borderColor: `${item.color}30`,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div className="admin-inline-actions">
                  {item.permisos.map((permiso) => (
                    <span key={`${item.key}-${permiso}`} className="admin-tag tag-info">
                      {permiso}
                    </span>
                  ))}
                </div>
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header ch-gold">
          <span>📊</span>
          <span className="admin-card-title">Resumen por Area</span>
        </div>
        <div className="admin-card-body admin-summary-list">
          {panel.areasResumen.map((item) => (
            <div key={item.area} className="admin-summary-row">
              <span>{item.area}</span>
              <strong>{item.total}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PerfilesSection;

