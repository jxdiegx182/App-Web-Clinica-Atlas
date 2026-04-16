import React from "react";

const ModalShell = ({ tone = "ch-navy", title, onClose, children, footer, width }) => (
  <div className="admin-modal-overlay" onClick={onClose}>
    <div className="admin-modal" style={width ? { width } : undefined} onClick={(event) => event.stopPropagation()}>
      <div className={`admin-modal-header ${tone}`}>
        <span className="admin-modal-title">{title}</span>
        <button type="button" className="admin-modal-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="admin-modal-body">{children}</div>
      <div className="admin-modal-footer">{footer}</div>
    </div>
  </div>
);

const AdminModals = ({ panel }) => {
  const modal = panel.openModal;
  if (!modal) return null;

  if (modal === "cargo") {
    return (
      <ModalShell
        title={panel.cargoTarget ? `Editar: ${panel.cargoForm.nom}` : "➕ Nuevo Cargo"}
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={panel.saveCargo}>
              💾 Guardar Cargo
            </button>
          </>
        }
      >
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Codigo *</label>
            <input className="fi" value={panel.cargoForm.cod} onChange={(e) => panel.setCargoForm((p) => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Categoria</label>
            <select className="fs" value={panel.cargoForm.cat} onChange={(e) => panel.setCargoForm((p) => ({ ...p, cat: e.target.value }))}>
              {panel.constants.cargoCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Nombre del Cargo *</label>
          <input className="fi" value={panel.cargoForm.nom} onChange={(e) => panel.setCargoForm((p) => ({ ...p, nom: e.target.value }))} />
        </div>

        <div className="fg">
          <label className="fl">Descripcion / Detalle</label>
          <textarea className="fta" value={panel.cargoForm.desc} onChange={(e) => panel.setCargoForm((p) => ({ ...p, desc: e.target.value }))} />
        </div>

        <div className="admin-form-grid-3">
          <div className="fg">
            <label className="fl">Valor ($) *</label>
            <input className="fi" type="number" value={panel.cargoForm.valor} onChange={(e) => panel.setCargoForm((p) => ({ ...p, valor: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Unidad de Cobro</label>
            <select className="fs" value={panel.cargoForm.unidad} onChange={(e) => panel.setCargoForm((p) => ({ ...p, unidad: e.target.value }))}>
              {panel.constants.cargoUnits.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Aplica IVA</label>
            <select className="fs" value={panel.cargoForm.iva} onChange={(e) => panel.setCargoForm((p) => ({ ...p, iva: e.target.value }))}>
              <option value="no">No (Exento)</option>
              <option value="si">Si (15%)</option>
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Requiere Autorizacion</label>
          <select className="fs" value={panel.cargoForm.auth} onChange={(e) => panel.setCargoForm((p) => ({ ...p, auth: e.target.value }))}>
            <option value="no">No - Aplicacion directa</option>
            <option value="medico">Si - Orden medica</option>
            <option value="gerencia">Si - Gerencia</option>
            <option value="seguro">Si - Seguro / Convenio</option>
          </select>
        </div>

        <div className="fg">
          <label className="fl">Areas donde aplica *</label>
          <div className="admin-checkbox-grid">
            {panel.constants.areaOptions.map((item) => (
              <label key={item.value} className="admin-check">
                <input
                  type="checkbox"
                  checked={panel.cargoForm.areas.includes(item.value)}
                  onChange={() => panel.toggleCargoArea(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Notas internas</label>
          <input className="fi" value={panel.cargoForm.notas} onChange={(e) => panel.setCargoForm((p) => ({ ...p, notas: e.target.value }))} />
        </div>
      </ModalShell>
    );
  }

  if (modal === "tarifa") {
    return (
      <ModalShell
        title={panel.tarifaTarget ? `Editar: ${panel.tarifaForm.label}` : "+ Nuevo Servicio"}
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={panel.saveTarifa}>
              💾 Guardar Servicio
            </button>
          </>
        }
      >
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Clave / Codigo *</label>
            <input className="fi" value={panel.tarifaForm.key} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, key: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Categoria</label>
            <select className="fs" value={panel.tarifaForm.cat} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, cat: e.target.value }))}>
              {panel.constants.tarifaCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Nombre del Servicio *</label>
          <input className="fi" value={panel.tarifaForm.label} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, label: e.target.value }))} />
        </div>

        <div className="admin-form-grid-3">
          <div className="fg">
            <label className="fl">Tipo de Calculo</label>
            <select className="fs" value={panel.tarifaForm.calculo} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, calculo: e.target.value, valor: e.target.value === "local" ? 0 : p.valor }))}>
              <option value="fijo">Tarifa fija</option>
              <option value="tiempo">Por tiempo</option>
              <option value="anestesia">Hoja de Anestesia</option>
              <option value="local">Sin cargo</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Unidad de Cobro</label>
            <select className="fs" value={panel.tarifaForm.unidad} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, unidad: e.target.value }))}>
              {panel.constants.tarifaUnits.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Valor ($)</label>
            <input className="fi" type="number" value={panel.tarifaForm.valor} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, valor: e.target.value }))} />
          </div>
        </div>

        {(panel.tarifaForm.calculo === "anestesia" || panel.tarifaForm.calculo === "tiempo") ? (
          <div className="admin-info-box">
            El cargo se puede calcular automaticamente desde el tiempo quirurgico y el tipo de
            anestesia registrado en el protocolo / hoja de anestesia.
          </div>
        ) : null}

        <div className="fg">
          <label className="fl">Notas / Condiciones</label>
          <textarea className="fta" value={panel.tarifaForm.notas} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, notas: e.target.value }))} />
        </div>

        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Justificacion *</label>
          <textarea className="fta" value={panel.tarifaForm.justif} onChange={(e) => panel.setTarifaForm((p) => ({ ...p, justif: e.target.value }))} />
        </div>
      </ModalShell>
    );
  }

  if (modal === "hoteleria") {
    return (
      <ModalShell
        title={panel.hoteleriaTarget ? `Editar: ${panel.hoteleriaForm.nom}` : "Nuevo Servicio de Hoteleria"}
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={panel.saveHoteleria}>
              💾 Guardar Servicio
            </button>
          </>
        }
      >
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Codigo *</label>
            <input className="fi" value={panel.hoteleriaForm.cod} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, cod: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Categoria</label>
            <select className="fs" value={panel.hoteleriaForm.cat} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, cat: e.target.value }))}>
              {panel.adminData.hoteleria.map((item) => item.cat).filter((value, index, arr) => arr.indexOf(value) === index).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="fg">
          <label className="fl">Nombre del Servicio *</label>
          <input className="fi" value={panel.hoteleriaForm.nom} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, nom: e.target.value }))} />
        </div>
        <div className="fg">
          <label className="fl">Descripcion</label>
          <textarea className="fta" value={panel.hoteleriaForm.desc} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, desc: e.target.value }))} />
        </div>
        <div className="admin-form-grid-3">
          <div className="fg">
            <label className="fl">Tarifa/dia ($) *</label>
            <input className="fi" type="number" value={panel.hoteleriaForm.precio} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, precio: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Aplica IVA</label>
            <select className="fs" value={panel.hoteleriaForm.iva} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, iva: e.target.value }))}>
              <option value="no">No (Exento)</option>
              <option value="si">Si (15%)</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Disponibilidad</label>
            <input className="fi" type="number" value={panel.hoteleriaForm.disp} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, disp: e.target.value }))} />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Incluye</label>
          <input className="fi" value={panel.hoteleriaForm.incluye} onChange={(e) => panel.setHoteleriaForm((p) => ({ ...p, incluye: e.target.value }))} />
        </div>
      </ModalShell>
    );
  }

  if (modal === "perfil") {
    const permissions = panel.constants.roles[panel.perfilForm.rol]?.permisos || [];
    return (
      <ModalShell
        title={panel.perfilTarget ? `Editar: ${panel.perfilForm.nombre}` : "Nuevo Usuario / Perfil"}
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={panel.savePerfil}>
              👤 Guardar Usuario
            </button>
          </>
        }
      >
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Nombre Completo *</label>
            <input className="fi" value={panel.perfilForm.nombre} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Cedula / ID</label>
            <input className="fi" value={panel.perfilForm.cedula} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, cedula: e.target.value }))} />
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Cargo / Especialidad</label>
            <select className="fs" value={panel.perfilForm.cargo} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, cargo: e.target.value }))}>
              {panel.constants.perfilCargos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Area / Servicio</label>
            <select className="fs" value={panel.perfilForm.area} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, area: e.target.value }))}>
              {panel.constants.perfilAreas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Usuario (login) *</label>
            <input className="fi" value={panel.perfilForm.user} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, user: e.target.value }))} />
          </div>
          <div className="fg">
            <label className="fl">Contrasena Temporal *</label>
            <input className="fi" type="password" value={panel.perfilForm.pass} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, pass: e.target.value }))} />
          </div>
        </div>
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Rol en el Sistema</label>
            <select className="fs" value={panel.perfilForm.rol} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, rol: e.target.value }))}>
              {Object.entries(panel.constants.roles).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Email Institucional</label>
            <input className="fi" value={panel.perfilForm.email} onChange={(e) => panel.setPerfilForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <div className="admin-info-box" style={{ marginBottom: 0 }}>
          <div className="fl" style={{ marginBottom: 8 }}>Permisos asignados al rol</div>
          <div className="admin-inline-actions">
            {permissions.map((item) => (
              <span key={item} className="admin-tag tag-info">
                {item}
              </span>
            ))}
          </div>
        </div>
      </ModalShell>
    );
  }

  if (modal === "rol") {
    const perfil = panel.adminData.perfiles.find((item) => item.id === panel.rolTarget);
    return (
      <ModalShell
        title="🔑 Asignar Rol"
        onClose={panel.closeModal}
        width="min(460px, 96vw)"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-success" onClick={panel.saveRoleChange}>
              🔑 Confirmar Cambio
            </button>
          </>
        }
      >
        <div className="admin-info-box">
          <div className="admin-name">{perfil?.nombre}</div>
          <div className="admin-subtext">
            {perfil?.cargo} · {perfil?.area}
          </div>
        </div>
        <div className="fg">
          <label className="fl">Nuevo Rol</label>
          <select className="fs" value={panel.roleDraft.rol} onChange={(e) => panel.setRoleDraft((p) => ({ ...p, rol: e.target.value }))}>
            {Object.entries(panel.constants.roles).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-info-box">
          <div className="fl" style={{ marginBottom: 8 }}>Permisos del rol seleccionado</div>
          <div className="admin-inline-actions">
            {(panel.rolePreview?.permisos || []).map((item) => (
              <span key={item} className="admin-tag tag-info">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Justificacion del cambio *</label>
          <textarea className="fta" value={panel.roleDraft.justif} onChange={(e) => panel.setRoleDraft((p) => ({ ...p, justif: e.target.value }))} />
        </div>
      </ModalShell>
    );
  }

  if (modal === "convenioEdit") {
    return (
      <ModalShell
        title={`Editar: ${panel.convenioEditForm.nombre || "Convenio"}`}
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={panel.saveConvenioEdit}>
              💾 Guardar
            </button>
          </>
        }
      >
        <div className="fg">
          <label className="fl">Nombre del Convenio</label>
          <input className="fi" value={panel.convenioEditForm.nombre} onChange={(e) => panel.setConvenioEditForm((p) => ({ ...p, nombre: e.target.value }))} />
        </div>
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Tipo de Tarifa</label>
            <select className="fs" value={panel.convenioEditForm.tipo} onChange={(e) => panel.setConvenioEditForm((p) => ({ ...p, tipo: e.target.value }))}>
              <option value="A">A — Privado</option>
              <option value="B">B — Tarifario Nacional</option>
              <option value="C">C — Seguro Privado</option>
              <option value="D">D — Institucional</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">% Ajuste</label>
            <input className="fi" type="number" value={panel.convenioEditForm.pct} onChange={(e) => panel.setConvenioEditForm((p) => ({ ...p, pct: e.target.value }))} />
          </div>
        </div>
        <div className="admin-form-grid-2" style={{ marginBottom: 0 }}>
          <div className="fg">
            <label className="fl">Aplica IVA</label>
            <select className="fs" value={panel.convenioEditForm.iva} onChange={(e) => panel.setConvenioEditForm((p) => ({ ...p, iva: e.target.value }))}>
              <option value="si">Si — Con IVA 15%</option>
              <option value="no">No — Exento IVA</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Estado</label>
            <select className="fs" value={panel.convenioEditForm.activo} onChange={(e) => panel.setConvenioEditForm((p) => ({ ...p, activo: e.target.value }))}>
              <option value="si">Activo</option>
              <option value="no">Inactivo</option>
            </select>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (modal === "convenioNew") {
    return (
      <ModalShell
        title="+ Nuevo Convenio"
        onClose={panel.closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={panel.closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-success" onClick={panel.saveConvenioNew}>
              ✅ Crear
            </button>
          </>
        }
      >
        <div className="fg">
          <label className="fl">Nombre del Convenio *</label>
          <input className="fi" value={panel.convenioNewForm.nombre} onChange={(e) => panel.setConvenioNewForm((p) => ({ ...p, nombre: e.target.value }))} />
        </div>
        <div className="admin-form-grid-2">
          <div className="fg">
            <label className="fl">Tipo</label>
            <select className="fs" value={panel.convenioNewForm.tipo} onChange={(e) => panel.setConvenioNewForm((p) => ({ ...p, tipo: e.target.value }))}>
              <option value="A">A — Privado</option>
              <option value="B">B — Tarifario Nac.</option>
              <option value="C">C — Seguro Privado</option>
              <option value="D">D — Institucional</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">% Ajuste</label>
            <input className="fi" type="number" value={panel.convenioNewForm.pct} onChange={(e) => panel.setConvenioNewForm((p) => ({ ...p, pct: e.target.value }))} />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label className="fl">Aplica IVA</label>
          <select className="fs" value={panel.convenioNewForm.iva} onChange={(e) => panel.setConvenioNewForm((p) => ({ ...p, iva: e.target.value }))}>
            <option value="si">Con IVA 15%</option>
            <option value="no">Exento IVA</option>
          </select>
        </div>
      </ModalShell>
    );
  }

  return null;
};

export default AdminModals;
