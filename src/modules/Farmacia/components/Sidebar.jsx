const TABS = [
  { key: "desp", label: "💊 Despacho" },
  { key: "camas", label: "🏥 Camas" },
  { key: "inv", label: "📦 Inventario" },
  { key: "ing", label: "📥 Ingresos" },
  { key: "hist", label: "📋 Historial" },
  { key: "pos", label: "🛒 Venta al Público" },
];

export default function Sidebar({ activeTab, onChangeTab, pendingOrders = 0, occupiedBeds = 0 }) {
  return (
    <div id="tabs">
      {TABS.map((tab) => (
        <div
          key={tab.key}
          className={`tab ${activeTab === tab.key ? "on" : ""}`}
          id={`tab-${tab.key}`}
          onClick={() => onChangeTab(tab.key)}
        >
          {tab.label}
          {tab.key === "desp" ? <span className="tn tn-r">{pendingOrders}</span> : null}
          {tab.key === "camas" ? <span className="tn tn-a">{occupiedBeds}</span> : null}
        </div>
      ))}
    </div>
  );
}
