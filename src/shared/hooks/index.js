/**
 * HOOKS REUTILIZABLES - CLÍNICA ATLAS
 * Exporta todos los hooks personalizados en un solo lugar
 */

// Formularios
export { useForm } from './useForm';

// Firebase
export { useFirestoreQuery, useFirestoreDocument, useFirestoreCollection } from './useFirestore';

// Validaciones médicas
export { useMedicalValidation } from './useMedicalValidation';

// Utilidades
export {
  useDebounce,
  useAsync,
  usePaginationMedical,
  usePreviousValue,
  useLocalStorage,
  useWindowSize,
  useToggle,
  useCountdown,
  useOutsideClick,
} from './useUtils';
