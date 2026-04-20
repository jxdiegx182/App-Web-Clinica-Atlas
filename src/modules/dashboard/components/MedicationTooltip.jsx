import React from 'react';
import { TimerIcon } from 'lucide-react';

/**
 * COMPONENTE: MedicationTooltip
 * Tooltip que muestra horarios de medicación con botones de check para enfermería.
 * Se activa con hover/click sobre el ícono de reloj en la columna de alertas.
 */
const MedicationTooltip = ({
  mainId,
  showTooltip,
  setShowTooltip,
  patientMedicationRows,
  pendingMedicationCount,
  isNurseUser,
  onMedicationHourClick,
  main,
}) => {
  return (
    <div
      key={mainId}
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setShowTooltip(mainId)}
      onMouseLeave={() => setShowTooltip(null)}
    >
      <div className="relative inline-flex items-center justify-center">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${pendingMedicationCount > 0
              ? 'border-red-300 bg-red-100 text-red-700'
              : 'border-emerald-300 bg-emerald-100 text-emerald-700'
            }`}
          title="Horario de medicamentos"
        >
          <TimerIcon className="h-4 w-4" />
        </span>
        {pendingMedicationCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
            {pendingMedicationCount > 9 ? '9+' : pendingMedicationCount}
          </span>
        ) : null}
      </div>

      {showTooltip === mainId && (
        <div className="absolute top-full left-1/2 z-[9999] w-80 -translate-x-1/2  
      rounded-lg bg-white border border-[#76C4D5] shadow-2xl p-4 text-xs text-gray-800 pointer-events-auto"
        > <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-bold text-[#4EA685]">
              HORARIO DE MEDICAMENTOS
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isNurseUser
                  ? 'bg-emerald-100 text-[#595759]'
                  : 'bg-[#76C4D5]-100 text-[#595759] border border-[#76C4D5]'
                }`}
            >
              {isNurseUser ? 'Checks habilitados (enfermería)' : 'Solo enfermería'}
            </span>
          </div>

          {patientMedicationRows.length === 0 ? (
            <p className="text-gray-600">
              Sin medicación pendiente para este paciente.
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {patientMedicationRows.map((medication) => (
                <div
                  key={medication.id}
                  className="rounded-lg border border-gray-200 bg-[#76C4D5]/20 px-2 py-2"
                >
                  <p className="font-semibold text-[#595759]">
                    {medication.medicamento}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {medication.scheduleHours.length === 0 ? (
                      <span className="text-[10px] text-amber-700">
                        Sin horas programadas
                      </span>
                    ) : (
                      medication.scheduleHours.map((hour) => {
                        const hourRecord =
                          medication.administracionesPorHora?.[hour];
                        const isCompleted =
                          Boolean(hourRecord?.confirmada);

                        return (
                          <button
                            type="button"
                            key={`${medication.id}-${hour}`}
                            onClick={() =>
                              onMedicationHourClick(
                                main,
                                medication,
                                hour
                              )
                            }
                            disabled={!isNurseUser || isCompleted}
                            className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${isCompleted
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-red-100 text-red-700 border border-red-300'
                              } ${!isNurseUser
                                ? 'cursor-not-allowed opacity-70'
                                : 'hover:brightness-95'
                              }`}
                            title={
                              isCompleted
                                ? `Registrado por ${hourRecord?.confirmadoPor || 'enfermería'}`
                                : isNurseUser
                                  ? 'Click para registrar administración'
                                  : 'Solo enfermería puede registrar'
                            }
                          >
                            {hour}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-2 text-[11px] font-bold">
            <p className="text-[#595759]">Pendientes:</p>
            <p className="text-[#B51414]">{pendingMedicationCount}</p>
          </div>

          {!isNurseUser ? (
            <p className="mt-1 text-[10px] text-[#595759]/50 font-bold">
              Solo usuarios de enfermería pueden registrar la medicación.
            </p>
          ) : null}

          {/* Flechita */}
          <div className="absolute left-6 top-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default MedicationTooltip;
