/**
 * VitalsInput - Input especializado para signos vitales
 * Con validación automática y conversión de unidades
 */

import React, { useState } from 'react';
import { MedicalInput } from './MedicalInput';
import { useMedicalValidation } from '@/shared/hooks';

export const BloodPressureInput = React.forwardRef(
  ({ 
    systalic, 
    diastolic, 
    onSystolicChange, 
    onDiastolicChange, 
    error,
    hint = 'Ej: 120 / 80 mmHg'
  }, ref) => {
    const { validatePressure } = useMedicalValidation();

    const handleBlur = () => {
      const errors = validatePressure(systalic, diastolic);
      if (Object.keys(errors).length > 0) {
        console.log('Presión arterial inválida:', errors);
      }
    };

    return (
      <div className="flex gap-4 items-end">
        <MedicalInput
          ref={ref}
          label="Presión Sistólica"
          unit="mmHg"
          type="number"
          min="0"
          max="250"
          value={systalic}
          onChange={(e) => onSystolicChange(e.target.value)}
          onBlur={handleBlur}
          error={error?.sys}
          placeholder="120"
        />
        <span className="text-xl text-gray-400 pb-2">/</span>
        <MedicalInput
          label="Presión Diastólica"
          unit="mmHg"
          type="number"
          min="0"
          max="160"
          value={diastolic}
          onChange={(e) => onDiastolicChange(e.target.value)}
          onBlur={handleBlur}
          error={error?.dias}
          placeholder="80"
        />
      </div>
    );
  }
);

BloodPressureInput.displayName = 'BloodPressureInput';

export const VitalsGrid = ({
  vitals = {},
  onVitalChange,
  errors = {},
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Presión Arterial */}
      <BloodPressureInput
        systalic={vitals.sysPA}
        diastolic={vitals.diasPA}
        onSystolicChange={(val) => onVitalChange('sysPA', val)}
        onDiastolicChange={(val) => onVitalChange('diasPA', val)}
        error={errors.pressure}
      />

      {/* Frecuencia Cardíaca */}
      <MedicalInput
        label="Frecuencia Cardíaca"
        unit="lpm"
        type="number"
        min="40"
        max="200"
        value={vitals.fc}
        onChange={(e) => onVitalChange('fc', e.target.value)}
        error={errors.fc}
        placeholder="--"
      />

      {/* Frecuencia Respiratoria */}
      <MedicalInput
        label="Frecuencia Respiratoria"
        unit="resp/min"
        type="number"
        min="4"
        max="60"
        value={vitals.fr}
        onChange={(e) => onVitalChange('fr', e.target.value)}
        error={errors.fr}
        placeholder="--"
      />

      {/* Temperatura */}
      <MedicalInput
        label="Temperatura"
        unit="°C"
        type="number"
        step="0.1"
        min="35"
        max="42"
        value={vitals.temp}
        onChange={(e) => onVitalChange('temp', e.target.value)}
        error={errors.temp}
        placeholder="37"
      />

      {/* Saturación de Oxígeno */}
      <MedicalInput
        label="Saturación O₂"
        unit="%"
        type="number"
        min="70"
        max="100"
        value={vitals.spo2}
        onChange={(e) => onVitalChange('spo2', e.target.value)}
        error={errors.spo2}
        placeholder="98"
      />

      {/* Peso */}
      <MedicalInput
        label="Peso"
        unit="kg"
        type="number"
        step="0.1"
        min="0.1"
        max="300"
        value={vitals.peso}
        onChange={(e) => onVitalChange('peso', e.target.value)}
        error={errors.peso}
        placeholder="70"
      />

      {/* Talla */}
      <MedicalInput
        label="Talla"
        unit="cm"
        type="number"
        min="40"
        max="250"
        value={vitals.talla}
        onChange={(e) => onVitalChange('talla', e.target.value)}
        error={errors.talla}
        placeholder="170"
      />
    </div>
  );
};

export default { BloodPressureInput, VitalsGrid };
