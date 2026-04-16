import React from "react";
import AdminTopbar from "./components/AdminTopbar";
import AdminTabs from "./components/AdminTabs";
import TarifarioSection from "./components/TarifarioSection";
import ConveniosSection from "./components/ConveniosSection";
import HoteleriaSection from "./components/HoteleriaSection";
import PerfilesSection from "./components/PerfilesSection";
import ColaSection from "./components/ColaSection";
import LogSection from "./components/LogSection";
import AdminModals from "./components/AdminModals";
import usePanelAdministrativo from "./hooks/usePanelAdministrativo";
import "./styles/panel-admin.css";

const sectionMap = {
  tarifario: TarifarioSection,
  convenios: ConveniosSection,
  hoteleria: HoteleriaSection,
  perfiles: PerfilesSection,
  cola: ColaSection,
  log: LogSection,
};

const PanelAdministrativo = () => {
  const panel = usePanelAdministrativo();
  const CurrentSection = sectionMap[panel.activeTab] || TarifarioSection;

  return (
    <div className="panel-admin-shell">
      <div className="panel-admin">
        <AdminTopbar
          session={panel.session}
          clock={panel.clock}
          onResetSession={panel.handleDoLogout}
        />

        <AdminTabs
          tabs={panel.tabs}
          activeTab={panel.activeTab}
          onChange={panel.setActiveTab}
          counters={panel.tabCounters}
        />

        <div className="admin-content">
          <CurrentSection panel={panel} />
        </div>
      </div>

      <AdminModals panel={panel} />

      {panel.toast.visible ? (
        <div className={`admin-toast toast-${panel.toast.tone || "success"}`}>
          {panel.toast.message}
        </div>
      ) : null}
    </div>
  );
};

export default PanelAdministrativo;
