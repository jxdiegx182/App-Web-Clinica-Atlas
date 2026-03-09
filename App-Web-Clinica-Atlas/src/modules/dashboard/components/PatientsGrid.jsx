import React, { useMemo } from 'react';
import { PatientCard } from './PatientCard';
import { Card } from '@/components/ui/card';

/**
 * COMPONENTE: PatientsGrid
 * Grid de tarjetas de pacientes
 */
export const PatientsGrid = ({
  patients,
  states,
  nursingAlerts,
  onStatusChange,
  onPatientClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-60 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">
          No se encontraron pacientes. Ajusta tus filtros.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          state={states[patient.id] || 'Atención'}
          hasAlert={nursingAlerts[patient.id]}
          onStatusChange={onStatusChange}
          onRowClick={onPatientClick}
        />
      ))}
    </div>
  );
};

export default PatientsGrid;
