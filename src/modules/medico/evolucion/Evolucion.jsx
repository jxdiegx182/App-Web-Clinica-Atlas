import { useState } from "react";
import SoabieForm from "./components/SoabieForm";
import DiagnosticoCIE10 from "./components/DiagnosticoCIE10";
import InfusionesTable from "./components/InfusionesTable";
import PrescripcionMedica from "./components/PrescripcionMedica";
import FarmaciaPanel from "./components/FarmaciaPanel";
import MedicacionHabitual from "./components/MedicacionHabitual";
import ExamenesComplementarios from "./components/ExamenesComplementarios";
import FirmaMedica from "./components/FirmaMedica";
import BottomBar from "./components/BottomBar";
import "./styles/evolucion.css";

const Evolucion = () => {
  const [formData, setFormData] = useState({});

  const handleSave = () => {
    console.log(formData);
    // aqui luego va Supabase
  };

  return (
    <>
      <main className="app">
        <SoabieForm data={formData} setData={setFormData} />
        <DiagnosticoCIE10 />
        <InfusionesTable />
        <PrescripcionMedica />
        <FarmaciaPanel />
        <MedicacionHabitual />
        <ExamenesComplementarios data={formData} setData={setFormData} />
        <FirmaMedica data={formData} setData={setFormData} />
      </main>

      <BottomBar
        paciente="Juan Pérez"
        dx="Neumonía"
        prescripciones={3}
        farmaciaPendientes={1}
        onGuardar={handleSave}
        onEnviarFarmacia={() => console.log("Enviar")}
        onAuditoria={() => console.log("Auditoría")}
      />
    </>
  );
};

export default Evolucion;
