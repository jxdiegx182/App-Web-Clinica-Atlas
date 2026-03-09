import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';

/**
 * COMPONENTE: DashboardStats
 * Estadísticas de la clínica
 */
export const DashboardStats = ({ stats = {} }) => {
  const {
    totalPatients = 0,
    activeEmergencies = 0,
    patientsInUCI = 0,
    currentTime = new Date(),
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Total Pacientes */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Pacientes</p>
              <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
            </div>
            <Users size={32} className="text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Emergencias Activas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">🚨 Emergencias</p>
              <p className="text-3xl font-bold text-red-600">{activeEmergencies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacientes UCI */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">UCI / Intensiva</p>
              <p className="text-3xl font-bold text-orange-600">{patientsInUCI}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hora Actual */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Hora Actual</p>
              <p className="text-lg font-bold text-gray-900">
                {currentTime.toLocaleTimeString('es-ES')}
              </p>
              <p className="text-xs text-gray-400">
                {currentTime.toLocaleDateString('es-ES')}
              </p>
            </div>
            <Clock size={32} className="text-purple-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
