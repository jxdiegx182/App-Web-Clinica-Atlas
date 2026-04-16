import React from "react";

const categoriaColor = {
  "Habitacion y Alojamiento": "#1a3a5c",
  "Alimentacion y Nutricion": "#2a9d8f",
  "Ropa de Cama y Lenceria": "#b7791f",
  "Comunicacion y Entretenimiento": "#3182ce",
  "Transporte Interno": "#553c9a",
  "Servicios Especiales": "#276749",
};

const HoteleriaSection = ({ panel }) => (
  <section>
    <div className="admin-card">
      <div className="admin-card-header ch-blue">
        <span>🏨</span>
        <span className="admin-card-title">Hoteleria Hospitalaria</span>
        <span className="admin-card-badge">{panel.hoteleria.length} servicios</span>
        <div className="admin-spacer" />
        <button type="button" className="btn btn-white" onClick={() => panel.openHoteleriaModal()}>
          + Nuevo Servicio
        </button>
        <button type="button" className="btn btn-white" onClick={panel.exportHoteleria}>
          ⬇ Exportar
        </button>
      </div>

      <div className="admin-muted-bar" style={{ color: "var(--pa-muted)" }}>
        Servicios no farmacologicos facturables durante la estadia del paciente.
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Servicio</th>
              <th>Categoria</th>
              <th>Descripcion</th>
              <th>Tarifa/dia</th>
              <th>IVA</th>
              <th>Disponible</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {panel.hoteleria.map((item) => {
              const color = categoriaColor[item.cat] || "#5a7a96";
              return (
                <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.55 }}>
                  <td className="admin-code">{item.cod}</td>
                  <td className="admin-name">{item.nom}</td>
                  <td>
                    <span
                      className="admin-tag"
                      style={{ color, background: `${color}18`, borderColor: `${color}30` }}
                    >
                      {item.cat}
                    </span>
                  </td>
                  <td className="admin-subtext">{item.desc || "-"}</td>
                  <td className="admin-money">${item.precio.toFixed(2)}</td>
                  <td className="admin-subtext">{item.iva === "si" ? "Con IVA 15%" : "Exento"}</td>
                  <td className="admin-code">{item.disp >= 999 ? "∞" : item.disp}</td>
                  <td>
                    <span className={`admin-tag ${item.activo ? "tag-success" : "tag-danger"}`}>
                      {item.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-inline-actions">
                      <button type="button" className="admin-mini-btn" onClick={() => panel.openHoteleriaModal(item)}>
                        ✏ Editar
                      </button>
                      <button type="button" className="admin-mini-btn" onClick={() => panel.toggleHoteleria(item.id)}>
                        {item.activo ? "Desactivar" : "Activar"}
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
  </section>
);

export default HoteleriaSection;

