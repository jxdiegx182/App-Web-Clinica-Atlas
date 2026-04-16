import React from "react";

const toneMap = {
  navy: "#1a3a5c",
  blue: "#3182ce",
  gold: "#b7791f",
  teal: "#2a9d8f",
  red: "#c53030",
  green: "#276749",
};

const KpiStrip = ({ items }) => (
  <div className="admin-kpis">
    {items.map((item) => (
      <div key={item.label} className="admin-kpi" style={{ "--tone": toneMap[item.tone] || toneMap.navy }}>
        <div className="admin-kpi-icon">{item.icon}</div>
        <div className="admin-kpi-value">{item.value}</div>
        <div className="admin-kpi-label">{item.label}</div>
      </div>
    ))}
  </div>
);

export default KpiStrip;
