export default function Header({
  clock,
  criticalCount = 0,
  onShowInventory,
  onOpenNewItem,
  onToggleAlerts,
}) {
  return (
    <div id="topbar">
      
      <span className="tb-mod">💊 Farmacia Central</span>
      <div className="tb-sp" />

      <span id="tbClk">
        {clock.toLocaleString("es-EC", {
          hour12: false,
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>

      <div className="bell" onClick={onToggleAlerts} title="Notificaciones">
        🔔
        {criticalCount > 0 ? (
          <span className="bell-n" style={{ display: "flex" }}>
            {criticalCount}
          </span>
        ) : null}
      </div>

      <button className="btn btn-ghost btn-sm" onClick={onShowInventory}>
        📦 Inventario
      </button>
      <button className="btn btn-teal btn-sm" onClick={onOpenNewItem}>
        + Med / Insumo / Implante
      </button>
    </div>
  );
}
