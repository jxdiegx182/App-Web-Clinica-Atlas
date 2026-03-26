export default function BottomBar({
  paciente,
  dx,
  prescripciones,
  farmaciaPendientes,
  onGuardar,
  onEnviarFarmacia,
  onAuditoria,
}) {
  return (
    <div className="btm">

      {/* STATS */}
      <div className="btm-stats">
        <div className="btm-s">
          <span className="btm-sl">Paciente</span>
          <span className="btm-sv">{paciente || "—"}</span>
        </div>

        <div className="btm-s">
          <span className="btm-sl">Dx Principal</span>
          <span className="btm-sv">{dx || "—"}</span>
        </div>

        <div className="btm-s">
          <span className="btm-sl">Prescripciones</span>
          <span className="btm-sv">{prescripciones || 0}</span>
        </div>

        <div className="btm-s">
          <span className="btm-sl">En Farmacia</span>
          <span className="btm-sv">
            {farmaciaPendientes || 0} pendientes
          </span>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="btm-actions">

        <button className="btn-outline" onClick={onAuditoria}>
          📦 Auditoría
        </button>

        <button className="btn-outline" onClick={onEnviarFarmacia}>
          📤 Enviar a Farmacia
        </button>

        <button className="btn-outline" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>

        <button className="btn-primary" onClick={onGuardar}>
          💾 Guardar Evolución
        </button>

      </div>
    </div>
  );
}