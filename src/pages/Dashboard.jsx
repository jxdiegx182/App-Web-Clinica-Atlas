import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowBigUp, ChevronLeft, ChevronRight } from 'lucide-react';

import { canAccessByRole, getAllowedRolesForDashboardModule } from '@/constants/accessControl';
import { PatientRow, DashboardHeader } from '@/modules/dashboard/components';
import { useDashboardData } from '@/modules/dashboard/hooks/useDashboardData';

const serviciosHospital = [
  'EMERGENCIA',
  'HOSPITAL DIA',
  'HOSPITALIZACION',
  'UCI',
  'UCI PEDIATRICA',
  'NEONATOLOGÍA',
  'CUIDADO',
];
const ESTADOS_OPCIONES = ['Espera', 'Atención', 'Terapia Intensiva', 'Alta Médica', 'Procedimiento', 'Quirófano'];
const UNAUTHORIZED_MODULE_BUTTON_MODE = 'hide';
import { ALTA_MEDICA_ESTADO } from '@/modules/dashboard/hooks/useDashboardData';

const formatUbicacionDashboard = (ubicacion) => {
  if (!ubicacion || typeof ubicacion !== 'object') return '(Sin ubicación)';
  const parts = [];
  if (ubicacion.habitacion) parts.push(String(ubicacion.habitacion));
  if (ubicacion.piso) parts.push(`Piso ${ubicacion.piso}`);
  if (!parts.length) return '(Sin ubicación)';
  return `(${parts.join(' | ')})`;
};

const moduleIcons = {
  'Modulo Médico': (
    <img
      src="https://cdn-icons-png.flaticon.com/512/3143/3143629.png"
      alt="Ícono Médico"
      className="w-9 h-9 object-contain"
    />
  ),
  'Modulo Examenes': (
    <img
      src="https://cdn-icons-png.freepik.com/512/2634/2634023.png"
      alt="Ícono Examenes"
      className="w-9 h-9 object-contain"
    />
  ),
  'Modulo Facturación': (
    <img
      src="https://cdn-icons-png.flaticon.com/512/5015/5015593.png"
      alt="Ícono Facturación"
      className="w-9 h-9 object-contain"
    />
  ),
  'Modulo Enfermeria': (
    <img
      src="https://images.icon-icons.com/807/PNG/512/nurse-1_icon-icons.com_66066.png"
      alt="Ícono Enfermería"
      className="w-9 h-9 object-contain"
    />
  ),
};

const moduleColors = {
  'Modulo Médico': 'border-blue-400 text-blue-500',
  'Modulo Enfermeria': 'border-blue-400 text-blue-500',
  'Modulo Examenes': 'border-blue-400 text-blue-500',
  'Modulo Facturación': 'border-blue-400 text-blue-500',
  'Parte Operatorio': 'border-blue-400 text-blue-500',
};


const Dashboard = () => {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    states: { searchTerm, estados, servicios, fechaHoraActual, showTooltip, orderAsc, currentPage, totalPages, safePage, paginatedMains, sortedMains, visibleMains, camasOcupadas, TOTAL_CAMAS, porcentajeOcupacion, totalTerapiaIntensiva, totalAltasMedicas, totalQuirofano, isNurseUser, isAdminUser },
    setters: { setSearchTerm, setShowTooltip, setOrderAsc, setCurrentPage },
    handlers: { handleEstadoChange, handleServicioChange, handleMedicationHourClick, getDynamicResumenVitales, getPatientMedicationRows, getPendingMedicationCount }
  } = useDashboardData();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Sesión cerrada", description: "Has salido del sistema correctamente" });
    navigate("/login");
  };

  const handleModuleClick = (mainId, moduleName) => {
    const hasAccess = canAccessByRole(role, getAllowedRolesForDashboardModule(moduleName));
    if (!hasAccess) { navigate("/unauthorized"); return; }
    if (moduleName === "Modulo Médico") { navigate(`/modulo-medico/${mainId}`, { state: { moduleName } }); }
    else if (moduleName === "Modulo Enfermeria") { navigate(`/modulo-enfermeria/${mainId}`, { state: { moduleName } }); }
    else if (moduleName === "Parte operatorio") { navigate(`/modulo-quirofano/${mainId}`, { state: { moduleName } }); }
    else { toast({ title: "🚧 Esta función no está implementada aún." }); }
  };

  const userCanAccessModule = (moduleName) => canAccessByRole(role, getAllowedRolesForDashboardModule(moduleName));
  const getRenderableModules = (modules = []) => {
    if (UNAUTHORIZED_MODULE_BUTTON_MODE === "hide") return modules.filter(userCanAccessModule);
    return modules;
  };
  return (
    <>
      <Helmet>
        <title>Dashboard - Clínica Atlas</title>
      </Helmet>

      <div className="min-h-screen w-full bg-gradient-to-br from-white via-[#f0f7f7] to-[#d9eeee]">
        <DashboardHeader
          isAdminUser={isAdminUser}
          profile={profile}
          user={user}
          role={role}
          handleLogout={handleLogout}
          fechaHoraActual={fechaHoraActual}
          camasOcupadas={camasOcupadas}
          TOTAL_CAMAS={TOTAL_CAMAS}
          porcentajeOcupacion={porcentajeOcupacion}
          totalTerapiaIntensiva={totalTerapiaIntensiva}
          totalAltasMedicas={totalAltasMedicas}
          totalQuirofano={totalQuirofano}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className=" max-w-full p-6 pb-72  ">
          <Card className="border-3 border-[#76c4d5]/90 shadow-lg rounded-xl overflow-visible ">
            <table className="w-full text-sm relative  ">
              <thead className="bg-[#69c9ba] text-white uppercase text-xs tracking-wider ">
                {/*turqueza encabezado */}
                <tr>
                  <th className="text-center px-4 py-3 cursor-pointer select-none hover:text-[#595759]"
                    onClick={() => setOrderAsc(!orderAsc)}>

                    <Calendar className="inline w-4 h-4 mr-2" />
                    Fecha Ingreso{' '}
                    <ArrowBigUp className="inline w-4 h-4 mr-2" />

                  </th>
                  <th className="text-left px-4 py-3 hover:text-[#595759]">Estancia</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Paciente</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">HCL</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Médico</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Alertas</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Estado</th>

                  <th className="text-center px-4 py-3 hover:text-[#595759]">Servicio</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Seguro</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Módulos</th>
                </tr>
              </thead>

              {/*Elgrupo para leer datos de las citas*/}
              <tbody>
                {paginatedMains.map((main, index) => {
                  const patientMedicationRows = getPatientMedicationRows(main.id);
                  const pendingMedicationCount = getPendingMedicationCount(main.id);
                  const estadoActualFila = estados[main.id] || main.estado || 'Atención';
                  const isAltaBloqueada = estadoActualFila === ALTA_MEDICA_ESTADO;
                  const servicioActual = servicios[main.id] || main.servicio || '';
                  const ubicacionTexto = formatUbicacionDashboard(main.ubicacion);

                  return (
                    <PatientRow
                      key={main.id}
                      main={main}
                      index={index}
                      estadoActualFila={estadoActualFila}
                      isAltaBloqueada={isAltaBloqueada}
                      servicioActual={servicioActual}
                      ubicacionTexto={ubicacionTexto}
                      vitales={getDynamicResumenVitales(main.id)}
                      patientMedicationRows={patientMedicationRows}
                      pendingMedicationCount={pendingMedicationCount}
                      showTooltip={showTooltip}
                      setShowTooltip={setShowTooltip}
                      isNurseUser={isNurseUser}
                      handleMedicationHourClick={handleMedicationHourClick}
                      handleEstadoChange={handleEstadoChange}
                      handleServicioChange={handleServicioChange}
                      getRenderableModules={getRenderableModules}
                      userCanAccessModule={userCanAccessModule}
                      handleModuleClick={handleModuleClick}
                      moduleColors={moduleColors}
                      moduleIcons={moduleIcons}
                      ESTADOS_OPCIONES={ESTADOS_OPCIONES}
                      serviciosHospital={serviciosHospital}
                      UNAUTHORIZED_MODULE_BUTTON_MODE={UNAUTHORIZED_MODULE_BUTTON_MODE}
                    />
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Pie de página con paginación */}
      <div className="flex justify-center items-center py-2 bg-white gap-4">
        <span className="text-sm text-gray-500">
          {sortedMains.length} paciente{sortedMains.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded font-bold text-sm transition ${
                page === safePage
                  ? 'bg-[#69c9ba] text-white shadow'
                  : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;