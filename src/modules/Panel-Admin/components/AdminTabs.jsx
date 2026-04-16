import React from "react";

const AdminTabs = ({ tabs, activeTab, onChange, counters }) => (
  <div className="admin-tabs">
    {tabs.map((tab) => {
      const count = counters?.[tab.id];
      return (
        <button
          key={tab.id}
          type="button"
          className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {count !== undefined ? <span className="admin-tab-count">{count}</span> : null}
        </button>
      );
    })}
  </div>
);

export default AdminTabs;

