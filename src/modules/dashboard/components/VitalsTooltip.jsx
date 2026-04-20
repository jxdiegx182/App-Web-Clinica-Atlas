import React from 'react';

/**
 * COMPONENTE: VitalsTooltip
 * Tooltip que muestra los últimos signos vitales del paciente.
 * Se activa con hover sobre el nombre del paciente en la tabla del Dashboard.
 */
const VitalsTooltip = ({ vitales }) => {
  return (
    <div
      className="pointer-events-none absolute top-full left-1/2 z-[9999] w-80 -translate-x-1/2 mt-2
        scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 rounded-lg bg-white border border-[#76C4D5]
        shadow-2xl p-4 text-xs text-gray-800"
    >
      <p className="font-bold text-[#595759] items-center mb-3 flex items-center gap-1">
        🩺 SIGNOS VITALES
      </p>

      <div className="bg-gradient-to-br from-[#76C4D5]/30 to-[#76C4D5]/30 rounded-lg p-3 text-sm text-gray-700">
        <h3 className="font-semibold text-slate-700 mb-2 text-center">ÚLTIMOS SIGNOS VITALES</h3>
        <div className="grid grid-cols-2 gap-2">
          {vitales.map((vital) => (
            <div key={vital.label} className="rounded-md px-2 py-1.5 bg-white text-slate-700 text-center border border-gray-200">
              <p className="text-[9px] font-semibold uppercase text-[#007e8f]">{vital.label}</p>
              <p className="text-xs font-bold text-gray-800">{vital.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flechita */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-2
          w-3 h-3 bg-white
          border-l border-t border-gray-200
          rotate-45"
      />
    </div>
  );
};

export default VitalsTooltip;
