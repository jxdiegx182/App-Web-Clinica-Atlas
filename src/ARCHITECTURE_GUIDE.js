/**
 * GUIDE - Nueva Estructura Modular
 * 
 * ANTES (Plana y difícil de mantener):
 * src/
 *   pages/ (20 archivos .jsx)
 *   components/ (sin organización)
 *   services/ (solo 2 archivos)
 * 
 * DESPUÉS (Modular por features):
 * src/
 *   modules/           ← Código específico de cada módulo médico
 *     emergencia/
 *       components/    ← Solo componentes de emergencia
 *       hooks/         ← Solo lógica de emergencia
 *       services/      ← API calls de emergencia
 *       types/         ← Tipos/interfaces de emergencia
 *       Emergencia.jsx ← Componente principal
 *     anamnesis/
 *     evolucion/
 *     dashboard/
 *   shared/            ← Código compartido entre módulos
 *     components/
 *       ui/            ← Button, Card, Input, Badge, etc (Radix UI)
 *       forms/         ← Componentes de formulario reutilizables
 *       layouts/       ← Layouts comunes
 *     hooks/
 *       useForm.js
 *       useFirestore.js
 *       useMedicalValidation.js
 *       useUtils.js
 *     theme/           ← Sistema de diseño
 *       colors.js      ← NUEVO: Paleta de colores
 *       typography.js  ← NUEVO: Tipografía
 *       index.js
 *   types/             ← Tipos compartidos (patient, user, etc)
 *   contexts/          ← AuthContext, ThemeContext, etc
 *   services/          ← Servicios compartidos (authService, userService)
 *   utils/             ← Utilidades compartidas
 *   App.jsx
 *   main.jsx
 * 
 * ============================================================================
 * IMPORTACIÓN DE LA NUEVA PALETA DE COLORES
 * ============================================================================
 * 
 * EN COMPONENTES:
 * 
 * import { colors, semantic, badges, modules } from '@/shared/theme';
 * 
 * // Usar directamente
 * <Badge className={`bg-[${colors.emergency}] text-[${colors.emergencyText}]`}>
 *   URGENTE
 * </Badge>
 * 
 * // O mejor, con Tailwind classes
 * const statusColors = semantic.states.urgentBg; // "#fef2f2"
 * 
 * ============================================================================
 * IMPORTACIÓN DE HOOKS
 * ============================================================================
 * 
 * // Opción 1: Importar lo que necesitas
 * import { useForm, useMedicalValidation } from '@/shared/hooks';
 * 
 * // Opción 2: Importar específicamente
 * import { useForm } from '@/shared/hooks/useForm';
 * import { useMedicalValidation } from '@/shared/hooks/useMedicalValidation';
 * 
 * ============================================================================
 * EJEMPLO: Cómo refactorizar Emergencia.jsx
 * ============================================================================
 * 
 * ANTES:
 * ------
 * // Emergencia.jsx (300+ líneas monstruosas)
 * const Emergencia = () => {
 *   const [formData, setFormData] = useState({...100 campos}); // PESADILLA
 *   const [lesionCount, setLesionCount] = useState(0);
 *   ... handlers mezclados ...
 *   return (500+ líneas de JSX)
 * }
 * 
 * DESPUÉS:
 * -------
 * // modules/emergencia/Emergencia.jsx (LIMPIO)
 * import { useEmergenciaForm } from './hooks/useEmergenciaForm';
 * import EmergenciaForm from './components/EmergenciaForm';
 * 
 * const Emergencia = () => {
 *   const { formData, handleChange, handleSubmit, errors } = useEmergenciaForm();
 *   
 *   return (
 *     <div>
 *       <EmergenciaForm formData={formData} ... />
 *     </div>
 *   );
 * };
 * 
 * // modules/emergencia/hooks/useEmergenciaForm.js (NUEVO)
 * export const useEmergenciaForm = () => {
 *   const { formData, handleChange, handleSubmit } = useForm(
 *     INITIAL_VALUES,
 *     onSubmit,
 *     validate
 *   );
 *   
 *   // Lógica específica de emergencia
 *   const handleVitalesChange = (field, value) => {...};
 *   
 *   return { formData, handleChange, handleVitalesChange, ... };
 * };
 * 
 * // modules/emergencia/components/EmergenciaForm.jsx (NUEVO)
 * const EmergenciaForm = ({ formData, handleChange, errors }) => {
 *   return (
 *     <form>
 *       <InstitutionSection ... />
 *       <AdmissionSection ... />
 *       <VitalsSection ... />
 *       ... SECCIONES MÁS PEQUEÑAS
 *     </form>
 *   );
 * };
 * 
 * ============================================================================
 * ESTRUCTURA POR MÓDULO (PLANTILLA)
 * ============================================================================
 * 
 * modules/nombre-modulo/
 * ├── nombre-modulo.jsx          # Componente principal (Container)
 * ├── components/
 * │   ├── FormMain.jsx           # Componente de formulario principal
 * │   ├── sections/
 * │   │   ├── Section1.jsx
 * │   │   ├── Section2.jsx
 * │   │   └── ...
 * │   └── inputs/
 * │       ├── CustomInput.jsx
 * │       └── ...
 * ├── hooks/
 * │   ├── useModuleForm.js        # Manejo de formulario
 * │   ├── useModuleData.js        # Carga de datos
 * │   └── useModuleCalculations.js # Cálculos específicos
 * ├── services/
 * │   └── moduleService.js        # API calls
 * ├── types/
 * │   └── module.types.js         # Interfaces
 * └── index.js                    # Exporta el módulo
 * 
 * ============================================================================
 * IMPORTAR DE PALETA DE COLORES EN COMPONENTES
 * ============================================================================
 * 
 * // components/EmergenciaHeader.jsx
 * import { colors, semantic, badges } from '@/shared/theme';
 * import { Badge } from '@/components/ui/badge';
 * 
 * export const EmergenciaHeader = () => {
 *   return (
 *     <>
 *       {/* Usar colores específicos para emergencias */}
 *       <Badge 
 *         className={`bg-[${semantic.states.urgentBg}] text-[${semantic.states.urgentText}]`}
 *       >
 *         🚨 {badges.emergency.icon} URGENTE
 *       </Badge>
 *       
 *       {/* O usar directo con módulo */}
 *       <div className={`bg-[${modules.emergencia.light}] p-4`}>
 *         Contenido de emergencia
 *       </div>
 *     </>
 *   );
 * };
 * 
 * ============================================================================
 * USAR VALIDACIONES MÉDICAS
 * ============================================================================
 * 
 * import { useMedicalValidation } from '@/shared/hooks';
 * 
 * const VitalsForm = () => {
 *   const { validatePressure, validateHeartRate, calculateBMI } = useMedicalValidation();
 *   
 *   const validate = (formData) => {
 *     // Validar presión
 *     const pressureErrors = validatePressure(formData.sysPA, formData.diasPA);
 *     if (pressureErrors.sys) setError('sysPA', pressureErrors.sys);
 *     
 *     // Calcular IMC
 *     const bmi = calculateBMI(formData.peso, formData.altura);
 *     console.log(`IMC: ${bmi.value} (${bmi.category})`);
 *   };
 * };
 * 
 * ============================================================================
 * USAR FORM HOOK AVANZADO
 * ============================================================================
 * 
 * const EmergenciaPage = () => {
 *   const { 
 *     formData,
 *     handleChange,
 *     handleArrayChange,    // Para arrays de lesiones, medicamentos
 *     addArrayItem,         // Agregar medicamento
 *     removeArrayItem,      // Eliminar medicamento
 *     handleSubmit,
 *     errors,
 *     isDirty,
 *     isSubmitting
 *   } = useForm(
 *     initialValues,
 *     async (data) => {
 *       // Guardación en Firestore
 *       await emergenciaService.save(data);
 *     },
 *     (data) => {
 *       // Validación personalizada
 *       const errors = {};
 *       
 *       // Validaciones vitales
 *       const pressureErrs = validatePressure(...);
 *       if (pressureErrs) errors.vitales = pressureErrs;
 *       
 *       return errors;
 *     }
 *   );
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input {...getFieldProps('institucion')} />
 *       
 *       {/* Array items (medicamentos) */}
 *       {formData.medicamentos?.map((med, idx) => (
 *         <MedicineInput 
 *           key={idx}
 *           value={med}
 *           onChange={(val) => handleArrayChange('medicamentos', idx, val)}
 *           onRemove={() => removeArrayItem('medicamentos', idx)}
 *         />
 *       ))}
 *       
 *       <button onClick={() => addArrayItem('medicamentos', {})}>
 *         Agregar medicamento
 *       </button>
 *     </form>
 *   );
 * };
 */
