import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getStatusColorObject } from '@/shared/theme/colors';
import { ChevronRight, MapPin, Calendar, User } from 'lucide-react';

/**
 * COMPONENTE: PatientCard
 * Tarjeta de paciente reutilizable
 * Renderiza información clave de un paciente
 */
export const PatientCard = ({
  patient,
  state,
  hasAlert = false,
  onStatusChange,
  onRowClick,
}) => {
  const navigate = useNavigate();
  const statusColor = getStatusColorObject(state);

  const handleNavigate = () => {
    if (onRowClick) {
      onRowClick(patient);
    } else {
      navigate(`/modulo-medico/${patient.id}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
      <CardHeader className="pb-3 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">
              {patient.primerNombre} {patient.apellidoPaterno}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Cédula: {patient.cedula || 'N/A'}
            </p>
          </div>

          {hasAlert && (
            <Badge className="bg-red-100 text-red-700 animate-pulse">
              🔴 Alerta
            </Badge>
          )}
        </div>

        {/* Estado */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColor.badge }}
          />
          <select
            value={state}
            onChange={(e) => onStatusChange?.(patient.id, e.target.value)}
            className="text-xs bg-transparent border border-gray-300 rounded px-2 py-1"
          >
            <option value="Espera">Espera</option>
            <option value="Atención">Atención</option>
            <option value="Terapia Intensiva">UCI</option>
            <option value="Procedimiento">Procedimiento</option>
            <option value="Alta Médica">Alta</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="text-xs text-gray-600 space-y-2">
        {/* Información médica compacta */}
        {patient.diagnosticoprincipal && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Dx:</span>
            <span className="truncate">{patient.diagnosticoprincipal}</span>
          </div>
        )}

        {patient.servicio && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <span>{patient.servicio}</span>
          </div>
        )}

        {patient.fechaAdmision && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span>{new Date(patient.fechaAdmision).toLocaleDateString('es-ES')}</span>
          </div>
        )}

        {/* Vitales resumidos */}
        {patient.vitales && (
          <div className="bg-gray-50 p-2 rounded mt-2">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>PA: <span className="font-semibold">{patient.vitales.pa || '--'}</span></div>
              <div>FC: <span className="font-semibold">{patient.vitales.fc || '--'}</span></div>
              <div>Temp: <span className="font-semibold">{patient.vitales.temp || '--'}°</span></div>
              <div>O2: <span className="font-semibold">{patient.vitales.saturacion || '--'}%</span></div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="px-4 py-3 border-t">
        <Button
          onClick={handleNavigate}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Ver Ficha <ChevronRight size={12} className="ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default PatientCard;
