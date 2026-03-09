/**
 * DiagnosisInput - Input para diagnósticos CIE-10
 * Con búsqueda y validación
 */

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MedicalInput } from './MedicalInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMedicalValidation } from '@/shared/hooks';

export const DiagnosisInput = React.forwardRef(
  ({
    diagnoses = [],
    onDiagnosisAdd,
    onDiagnosisRemove,
    onDiagnosisChange,
    maxDiagnoses = 5,
    error = null,
  }, ref) => {
    const { validateDiagnosis } = useMedicalValidation();
    const [newDiagnosis, setNewDiagnosis] = useState('');

    const handleAdd = () => {
      const errors = validateDiagnosis(newDiagnosis);
      if (!errors) {
        onDiagnosisAdd({
          code: '',
          description: newDiagnosis,
          date: new Date().toISOString().split('T')[0],
        });
        setNewDiagnosis('');
      }
    };

    const handleAddFromEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <MedicalInput
            ref={ref}
            label="Agregar Diagnóstico"
            placeholder="Ej: Hipertensión arterial"
            value={newDiagnosis}
            onChange={(e) => setNewDiagnosis(e.target.value)}
            onKeyDown={handleAddFromEnter}
            disabled={diagnoses.length >= maxDiagnoses}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAdd}
            disabled={diagnoses.length >= maxDiagnoses || !newDiagnosis.trim()}
            className="self-end"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* Lista de diagnósticos */}
        <div className="flex flex-col gap-2">
          {diagnoses.map((diagnosis, idx) => (
            <Card key={idx} className="p-3 flex items-center justify-between bg-blue-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {diagnosis.description}
                </p>
                <p className="text-xs text-gray-500">
                  {diagnosis.code && `CIE-10: ${diagnosis.code}`}
                  {diagnosis.date && ` • ${diagnosis.date}`}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDiagnosisRemove(idx)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>

        {diagnoses.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay diagnósticos registrados
          </p>
        )}

        {diagnoses.length > 0 && (
          <p className="text-xs text-gray-500">
            {diagnoses.length} de {maxDiagnoses} diagnósticos
          </p>
        )}
      </div>
    );
  }
);

DiagnosisInput.displayName = 'DiagnosisInput';

export default DiagnosisInput;
