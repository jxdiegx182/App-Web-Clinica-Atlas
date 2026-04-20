import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { getStatusColorObject } from '@/shared/theme/colors';
import VitalsTooltip from './VitalsTooltip';
import MedicationTooltip from './MedicationTooltip';

const PatientRow = ({
  main,
  index,
  estadoActualFila,
  isAltaBloqueada,
  servicioActual,
  ubicacionTexto,
  vitales,
  patientMedicationRows,
  pendingMedicationCount,
  showTooltip,
  setShowTooltip,
  isNurseUser,
  handleMedicationHourClick,
  handleEstadoChange,
  handleServicioChange,
  getRenderableModules,
  userCanAccessModule,
  handleModuleClick,
  moduleColors,
  moduleIcons,
  ESTADOS_OPCIONES,
  serviciosHospital,
  UNAUTHORIZED_MODULE_BUTTON_MODE,
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-slate-100 transition-colors`}
    >
      {/* FECHA INGRESO */}
      <td className="px-4 py-3 text-center text-[#595759] font-medium bg-[#69c9ba]/20 ">
        {main.fechaIngreso}
      </td>

      {/* ESTANCIA */}
      <td className="px-4 py-3 text-center text-[#595759] font-medium ">
        {main.estancia} <h1>días</h1>
      </td>

      {/* PACIENTE y SIGNOS VITALES */}
      <td className="relative px-4 py-3 bg-[#69c9ba]/20 text-center">
        <div className="inline-block group cursor-pointer">
          <span className="text-[#595759] font-bold group-hover:text-[#4ea685] transition">
            {main.nombre}
          </span>
          <VitalsTooltip vitales={vitales} />
        </div>
      </td>

      {/* CEDULA */}
      <td className="px-4 py-3 text-[#4EA685] font-semibold ">
        {main.cedula}
      </td>

      {/* MEDICO */}
      <td className="px-4 py-3 text-[#595759] font-medium bg-[#69c9ba]/20">
        {main.medico}
      </td>

      {/* ALERTAS, ALERGIAS Y MEDICACIÓN */}
      <td className="px-4 py-3 text-[#000d5b] relative ">
        {/* ALERGIAS 1 */}
        <div className="inline-block group cursor-pointer mr-1">
          <span className="text-gray-900 font-medium group-hover:text-[#007e8f] transition">
            {main.alergiaIconUno}
          </span>
          <div
            className="pointer-events-none absolute bottom-full left-1/2 z-50 w-64 -translate-x-[-80px] -translate-y-[-60px] 
              scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-90 transition-all duration-200 rounded-xl bg-white border border-gray-300
              shadow-xl p-3 text-xs text-gray-800"
          >
            <p className="font-semibold text-[#007e8f] mb-2 flex items-center gap-1">
              Alergía a:
            </p>
            <ul className="space-y-1/2">
              <li>{main.alergiaUno}</li>
            </ul>
            <div className="absolute left-1 top-full -translate-x-4 -translate-y-10 w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
          </div>
        </div>

        {/* INDICACIONES */}
        <div className="inline-block group cursor-pointer mr-1">
          <span className="text-gray-900 font-medium group-hover:text-[#007e8f] transition">
            {main.alergiaIconDos}
          </span>
          <div
            className="pointer-events-none absolute bottom-full left-1/2 z-50 w-64 -translate-x-[-80px] -translate-y-[-60px] 
              scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-90 transition-all duration-200 rounded-xl bg-white border border-gray-300
              shadow-xl p-3 text-xs text-gray-800"
          >
            <ul className="space-y-1/2">
              <li>{main.alergiaDos}</li>
            </ul>
            <div className="absolute left-1 top-full -translate-x-4 -translate-y-10 w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
          </div>
        </div>

        {/* MEDICACIÓN TOOLTIP */}
        <MedicationTooltip
          mainId={main.id}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          patientMedicationRows={patientMedicationRows}
          pendingMedicationCount={pendingMedicationCount}
          isNurseUser={isNurseUser}
          onMedicationHourClick={handleMedicationHourClick}
          main={main}
        />
      </td>

      {/* ESTADO */}
      <td className="px-4 py-3 text-center font-medium bg-[#69c9ba]/10">
        <div className="flex items-center justify-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getStatusColorObject(estadoActualFila).badge }}
          />
          <select
            value={estadoActualFila}
            onChange={(e) => handleEstadoChange(main.id, e.target.value)}
            disabled={isAltaBloqueada}
            className={`px-2 py-1 rounded-full text-xs font-semibold bg-[#69c9ba]/50 text-[#000000]/70 transition ${
              isAltaBloqueada ? 'cursor-not-allowed opacity-100' : 'hover:text-[#000000]'
            }`}
          >
            {ESTADOS_OPCIONES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* SERVICIO */}
      <td className="px-4 py-3 text-center font-medium">
        <div className="flex flex-col items-center">
          <select
            value={servicioActual}
            onChange={(e) => handleServicioChange(main.id, e.target.value)}
            disabled={isAltaBloqueada}
            className={`bg-transparent border-none outline-none font-bold text-[#4ea685] transition ${
              isAltaBloqueada ? 'cursor-not-allowed opacity-70' : 'hover:text-[#595759]'
            }`}
          >
            {serviciosHospital.map((servicio) => (
              <option key={servicio} value={servicio}>
                {servicio}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-gray-500 mt-1 leading-tight hover:text-[#000000]">
            {ubicacionTexto}
          </div>
        </div>
      </td>

      {/* SEGURO */}
      <td className="px-4 py-3 text-[#000d5b] bg-[#69c9ba]/20">{main.seguro}</td>

      {/* MODULOS */}
      <td className="px-4 py-3 ">
        <div className="flex justify-center gap-2">
          {getRenderableModules(main.modulos).map((modulo, idx) => {
            const hasAccess = userCanAccessModule(modulo);
            const shouldDisable = UNAUTHORIZED_MODULE_BUTTON_MODE === 'disable' && !hasAccess;

            return (
              <Button
                key={idx}
                size="icon"
                variant="outline"
                disabled={shouldDisable}
                onClick={() => handleModuleClick(main.id, modulo)}
                className={`relative rounded-full border-2 shadow-sm bg-white transition ${moduleColors[modulo]} ${
                  shouldDisable ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-100 hover:shadow-md'
                }`}
                title={shouldDisable ? `${modulo} (sin permisos para tu rol)` : modulo}
              >
                {moduleIcons[modulo] || <FileText className="w-5 h-5" />}
                {modulo === 'Modulo Enfermeria' && pendingMedicationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white">
                    {pendingMedicationCount > 9 ? '9+' : pendingMedicationCount}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </td>
    </motion.tr>
  );
};

export default PatientRow;
