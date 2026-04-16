import React from "react";

const AdminTopbar = ({ session, clock, onResetSession }) => (
  <div className="admin-topbar">
    <div className="admin-logo">
      <div className="admin-logo-box">M8</div>
      <div>
        <div className="admin-logo-name">
          Medix<b>8</b> · Admin
        </div>
        <div className="admin-logo-sub">Panel Administrativo</div>
      </div>
    </div>

    <div className="admin-session">
      <div className="admin-session-dot" />
      <div>
        <div className="admin-session-name">{session?.nombre || "-"}</div>
        <div className="admin-session-role">Rol: {session?.rol || "-"}</div>
      </div>
    </div>

    <div className="admin-spacer" />

    <div className="admin-clock">{clock}</div>
    <a href="/farmacia" className="btn btn-white">
      ← Farmacia
    </a>
    <button type="button" className="btn btn-danger" onClick={onResetSession}>
      ↻ Reiniciar Sesion
    </button>
  </div>
);

export default AdminTopbar;

