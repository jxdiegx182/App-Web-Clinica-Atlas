// ══════════════════════════════════════════════════════
// APP.JSX — MANFHER SYSTEMS · Atlas HIS
// Form. 005 — Evolución y Prescripciones
// Punto de entrada principal — orquesta todos los módulos
// ══════════════════════════════════════════════════════
import { useEffect } from 'react';
import { HCUProvider, useHCU } from './store/hcuStore';
import { useToast, useBridgeFarmacia } from './hooks';
import './styles/global.css';

// Secciones
import Header        from './components/Header';
import BottomBar     from './components/BottomBar';
import PrintHeader   from './components/PrintHeader';
import Toast         from './components/Toast';
import ModalPinFirma from './components/ModalPinFirma';

// Cards del formulario
import SeccionPaciente       from './components/SeccionPaciente';
import SeccionVitales        from './components/SeccionVitales';
import SeccionSOABIE         from './components/SeccionSOABIE';
import SeccionDiagnostico    from './components/SeccionDiagnostico';
import SeccionInfusiones     from './components/SeccionInfusiones';
import SeccionPrescripciones from './components/SeccionPrescripciones';
import PanelFarmacia         from './components/PanelFarmacia';
import SeccionMedHabitual    from './components/SeccionMedHabitual';
import SeccionExamenes       from './components/SeccionExamenes';
import SeccionFirma       from './components/SeccionFirma';

// Modales globales
import ModalDescontinuar    from './components/ModalDescontinuar';
import ModalDevolucion      from './components/ModalDevolucion';
import ModalSolicitudFarma  from './components/ModalSolicitudFarma';

function HCUForm() {
  const { state, actions } = useHCU();
  const { toast, showToast } = useToast();
  const { sync } = useBridgeFarmacia();

  // Guardar evolución — abre modal PIN
  const handleGuardar = () => {
    // El modal PIN se maneja en ModalPinFirma
    // Emitir evento para abrir el modal
    window.dispatchEvent(new CustomEvent('atlas:openPinModal'));
  };

  // Imprimir
  const handleImprimir = () => window.print();

  // Sincronizar header imprimible cuando cambia el paciente
  useEffect(() => {
    // Nada que hacer en React — PrintHeader se suscribe al estado
  }, [state.paciente]);

  return (
    <div className="atlas-root">
      {/* Header de app (solo pantalla) */}
      <Header onGuardar={handleGuardar} onImprimir={handleImprimir} />

      {/* Header imprimible MSP Form. 005 (solo print) */}
      <PrintHeader paciente={state.paciente} hoja={state.paciente.hoja} establecimiento={state.establecimiento} />

      {/* Toast global */}
      <Toast msg={toast.msg} visible={toast.visible} />

      {/* Alertas farmacia */}
      <div id="farmacia-alert-wrap" style={{ position: 'fixed', top: 78, right: 20, zIndex: 790, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340 }} />

      {/* MAIN */}
      <main className="app">
        <SeccionPaciente showToast={showToast} />
        <SeccionVitales showToast={showToast} />
        <SeccionSOABIE />
        <SeccionDiagnostico showToast={showToast} />
        <SeccionInfusiones />
        <SeccionPrescripciones showToast={showToast} />
        <PanelFarmacia showToast={showToast} />
        <SeccionMedHabitual />
        <SeccionExamenes />
        <SeccionFirma showToast={showToast} />
      </main>

      {/* Bottom bar (solo pantalla) */}
      <BottomBar
        onGuardar={handleGuardar}
        onImprimir={handleImprimir}
        onAuditoria={() => window.dispatchEvent(new CustomEvent('atlas:openDevolucion'))}
        onEnviarTodo={() => window.dispatchEvent(new CustomEvent('atlas:enviarTodoFarmacia'))}
      />

      {/* Modales globales */}
      <ModalDescontinuar showToast={showToast} />
      <ModalDevolucion showToast={showToast} />
      <ModalSolicitudFarma showToast={showToast} />
      <ModalPinFirma showToast={showToast} onSync={sync} />
    </div>
  );
}

export default function App() {
  return (
    <HCUProvider>
      <HCUForm />
    </HCUProvider>
  );
}
