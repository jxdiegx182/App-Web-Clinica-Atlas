/**
 * ====================================================================
 * EJEMPLO PRÁCTICO: REFACTORIZACIÓN DE EMERGENCIA.JSX
 * ====================================================================
 * 
 * Este archivo muestra PASO A PASO cómo refactorizar el componente
 * Emergencia.jsx usando el nuevo sistema.
 * 
 * ANTES: 300+ líneas - Todo mezclado
 * DESPUÉS: 50 líneas - Lógica extraída, presentación limpia
 */

// ===================== PASO 1: CREAR HOOK DE LÓGICA =======================

// src/modules/emergencia/hooks/useEmergenciaForm.js
import { useForm, useAsync } from '@/shared/hooks';
import { fetchEmergenciaData, saveEmergencia } from '../services/emergenciaService';
import { validateEmergencia } from '../services/validationService';

export const useEmergenciaForm = (mainId) => {
  // ✅ LÓGICA 1: Cargar datos existentes
  const { data: existingData, loading: dataLoading } = useAsync(
    () => (mainId ? fetchEmergenciaData(mainId) : Promise.resolve(null)),
    !!mainId
  );

  // ✅ LÓGICA 2: Formulario con validación
  const form = useForm(
    existingData || {
      // Institución
      institucion: '',
      unidadOperativa: '',
      codUO: '',
      // Admisión
      apellidoPaterno: '',
      apellidoMaterno: '',
      primerNombre: '',
      cedula: '',
      // ... resto de campos
    },
    // onSubmit
    async (data) => {
      try {
        const result = await saveEmergencia(mainId, data);
        return result;
      } catch (error) {
        throw new Error('Error al guardar: ' + error.message);
      }
    },
    // onValidate
    (data) => validateEmergencia(data)
  );

  return {
    ...form,
    loading: dataLoading || form.isSubmitting,
  };
};

// ===================== PASO 2: COMPONENTE SESSION =======================

// src/modules/emergencia/hooks/useVitalsCalculations.js
import { useState, useEffect } from 'react';

export const useVitalsCalculations = (vitales = {}) => {
  const [glasgowTotal, setGlasgowTotal] = useState(0);

  // ✅ LÓGICA 3: Cálculos de vitales
  useEffect(() => {
    const o = parseInt(vitales.glasgowOcular) || 0;
    const v = parseInt(vitales.glasgowVerbal) || 0;
    const m = parseInt(vitales.glasgowMotora) || 0;
    setGlasgowTotal(o + v + m);
  }, [vitales]);

  return { glasgowTotal };
};

// ===================== PASO 3: SERVICIO =======================

// src/modules/emergencia/services/emergenciaService.js
import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const fetchEmergenciaData = async (mainId) => {
  const docRef = doc(db, 'admisiones', mainId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveEmergencia = async (mainId, data) => {
  const docRef = doc(db, 'admisiones', mainId);
  await setDoc(docRef, {
    medicalData: { ...data },
    updatedAt: new Date(),
  }, { merge: true });
  return { success: true, id: mainId };
};

// ===================== PASO 4: COMPONENTE PRESENTACIÓN =======================

// src/modules/emergencia/components/EmergenciaForm.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { semanticColors } from '@/shared/theme/colors';
import { InstitutionSection } from './sections/InstitutionSection';
import { AdmissionSection } from './sections/AdmissionSection';
import { VitalsSection } from './sections/VitalsSection';
import { DiagnosticsSection } from './sections/DiagnosticsSection';

export const EmergenciaForm = ({
  formData,
  handleChange,
  handleBlur,
  handleSubmit,
  errors,
  touched,
  isSubmitting,
  submitError,
  glasgowTotal,
}) => {
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Error global */}
      {submitError && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{submitError}</p>
          </CardContent>
        </Card>
      )}

      {/* Secciones separadas - componentes pequeños y reutilizables */}
      <InstitutionSection
        data={formData}
        onChange={handleChange}
        onBlur={handleBlur}
        errors={errors}
        touched={touched}
      />

      <AdmissionSection
        data={formData}
        onChange={handleChange}
        onBlur={handleBlur}
        errors={errors}
        touched={touched}
      />

      <VitalsSection
        data={formData}
        onChange={handleChange}
        errors={errors}
        glasgowTotal={glasgowTotal}
      />

      <DiagnosticsSection
        data={formData}
        onChange={handleChange}
        errors={errors}
      />

      {/* Botones de acción */}
      <Card className="mt-8">
        <CardContent className="pt-6 flex gap-3 justify-end">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

// ===================== PASO 5: SECCIONES =======================

// src/modules/emergencia/components/sections/InstitutionSection.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const InstitutionSection = ({
  data,
  onChange,
  onBlur,
  errors,
  touched,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Institución</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Institución</label>
          <Input
            value={data.institucion}
            onChange={(e) => onChange('institucion', e.target.value)}
            onBlur={() => onBlur('institucion')}
            className={errors.institucion && touched.institucion ? 'border-red-500' : ''}
          />
          {errors.institucion && touched.institucion && (
            <p className="text-xs text-red-600 mt-1">{errors.institucion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unidad Operativa</label>
          <Input
            value={data.unidadOperativa}
            onChange={(e) => onChange('unidadOperativa', e.target.value)}
            onBlur={() => onBlur('unidadOperativa')}
            className={errors.unidadOperativa && touched.unidadOperativa ? 'border-red-500' : ''}
          />
          {errors.unidadOperativa && touched.unidadOperativa && (
            <p className="text-xs text-red-600 mt-1">{errors.unidadOperativa}</p>
          )}
        </div>

        {/* Más campos siguiendo el mismo patrón */}
      </CardContent>
    </Card>
  );
};

// src/modules/emergencia/components/sections/VitalsSection.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalsInput } from '@/shared/components/medical/VitalsInput';
import { semanticColors } from '@/shared/theme/colors';

export const VitalsSection = ({ data, onChange, errors, glasgowTotal }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signos Vitales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid de vitales - usando componente reutilizable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalsInput
            label="P.A."
            value={data.vitales?.pa || ''}
            onChange={(v) => onChange('vitales.pa', v)}
            unit="mmHg"
            error={errors.vitales?.pa}
          />
          <VitalsInput
            label="Pulso"
            value={data.vitales?.fc || ''}
            onChange={(v) => onChange('vitales.fc', v)}
            unit="lpm"
            error={errors.vitales?.fc}
          />
          <VitalsInput
            label="Temperatura"
            value={data.vitales?.temp || ''}
            onChange={(v) => onChange('vitales.temp', v)}
            unit="°C"
            error={errors.vitales?.temp}
          />
          <VitalsInput
            label="O2"
            value={data.vitales?.saturacion || ''}
            onChange={(v) => onChange('vitales.saturacion', v)}
            unit="%"
            error={errors.vitales?.saturacion}
          />
        </div>

        {/* Escala Glasgow */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Escala de Glasgow</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Ocular</label>
              <select
                value={data.glasgowOcular || ''}
                onChange={(e) => onChange('glasgowOcular', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar</option>
                {[1, 2, 3, 4].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Verbal</label>
              <select
                value={data.glasgowVerbal || ''}
                onChange={(e) => onChange('glasgowVerbal', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar</option>
                {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Motora</label>
              <select
                value={data.glasgowMotora || ''}
                onChange={(e) => onChange('glasgowMotora', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar</option>
                {[1, 2, 3, 4, 5, 6].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 text-lg font-bold" 
            style={{ color: semanticColors.statusInfo.badge }}>
            Total: {glasgowTotal}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===================== PASO 6: COMPONENTE PRINCIPAL =======================

// src/modules/emergencia/Emergencia.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useEmergenciaForm } from './hooks/useEmergenciaForm';
import { useVitalsCalculations } from './hooks/useVitalsCalculations';
import { EmergenciaForm } from './components/EmergenciaForm';

/**
 * COMPONENTE: Emergencia
 * 
 * Este es un CONTAINER - solo orquesta hooks y componentes
 * La presentación está en EmergenciaForm
 * La lógica está en useEmergenciaForm
 */
export const Emergencia = () => {
  const { mainId } = useParams();

  // ✅ Toda la lógica en hooks
  const emerg enciaForm = useEmergenciaForm(mainId);
  const { glasgowTotal } = useVitalsCalculations(emergenciaForm.formData?.vitales);

  // ✅ Mostrar loading
  if (emergenciaForm.loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  // ✅ Renderizar presentación pura
  return (
    <>
      <Helmet>
        <title>Protocolo de Emergencia - Clínica Atlas</title>
      </Helmet>
      
      <EmergenciaForm
        {...emergenciaForm}
        glasgowTotal={glasgowTotal}
      />
    </>
  );
};

export default Emergencia;

// ===================== PASO 7: ÍNDICE DEL MÓDULO =======================

// src/modules/emergencia/index.js
export { Emergencia } from './Emergencia';
export { useEmergenciaForm } from './hooks/useEmergenciaForm';
export { useVitalsCalculations } from './hooks/useVitalsCalculations';

// ===================== RESUMEN DE CAMBIOS =======================

/*
 * ANTES:
 * - Emergencia.jsx: 300+ líneas
 * - Todo mezclado: state, handlers, validación, presentación
 * - Difícil de testear
 * - Difícil de mantener
 * - Difé il de reutilizar
 * 
 * DESPUÉS:
 * - Emergencia.jsx: 50 líneas (solo orquestación)
 * - EmergenciaForm.jsx: 100 líneas (solo presentación)
 * - useEmergenciaForm.js: 50 líneas (lógica del formulario)
 * - sections/*.jsx: Componentes pequeños y reutilizables
 * 
 * BENEFICIOS:
 * ✅ Más fácil de entender (cada archivo tiene responsabilidad única)
 * ✅ Más fácil de mantener (lógica centralizada en hooks)
 * ✅ Más fácil de testear (hooks y componentes puro puros)
 * ✅ Más fácil de reutilizar (secciones independientes)
 * ✅ Escalable (fácil agregar nuevas secciones)
 */
