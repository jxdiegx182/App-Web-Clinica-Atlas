/**
 * useForm - Hook para manejo profundo de formularios
 * 
 * Características:
 * - State management automático
 * - Validación en tiempo real
 * - Manejo de arrays/objetos
 * - Reset y limpieza
 * - Integración con Firebase Firestore
 * 
 * Uso:
 * const { formData, handleChange, handleSubmit, errors } = useForm(
 *   initialValues,
 *   async (data) => await saveToFirestore(data),
 *   (data) => validateData(data)
 * );
 */

import { useState, useCallback, useRef } from 'react';

export const useForm = (
  initialValues = {},
  onSubmit = null,
  onValidate = null,
  options = {}
) => {
  const { resetOnSuccess = true, validateOnChange = false, validateOnBlur = true } = options;

  const [formData, setFormData] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialRef = useRef(initialValues);

  // Validar un campo específico
  const validateField = useCallback(
    (fieldName, value) => {
      if (!onValidate) return {};

      const fieldErrors = onValidate({ ...formData, [fieldName]: value });
      return fieldErrors ? fieldErrors[fieldName] : null;
    },
    [formData, onValidate]
  );

  // Manejar cambio de un campo simple
  const handleChange = useCallback(
    (fieldNameOrEvent, value = null) => {
      let fieldName, fieldValue;

      // Soporta tanto onChange de input como llamada directa
      if (fieldNameOrEvent?.target) {
        fieldName = fieldNameOrEvent.target.name;
        fieldValue = fieldNameOrEvent.target.value;
      } else {
        fieldName = fieldNameOrEvent;
        fieldValue = value;
      }

      setFormData(prev => {
        const updated = { ...prev, [fieldName]: fieldValue };

        // Validar mientras se escribe (si está habilitado)
        if (validateOnChange) {
          const fieldError = validateField(fieldName, fieldValue);
          setErrors(prev => ({
            ...prev,
            [fieldName]: fieldError,
          }));
        }

        return updated;
      });

      setIsDirty(true);
    },
    [validateOnChange, validateField]
  );

  // Manejar cambio en campos anidados (para objetos)
  const handleNestedChange = useCallback(
    (parentField, childField, value) => {
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: value,
        },
      }));
      setIsDirty(true);
    },
    []
  );

  // Manejar cambio en arrays (agregar/actualizar item)
  const handleArrayChange = useCallback(
    (fieldName, index, value) => {
      setFormData(prev => {
        const array = [...(prev[fieldName] || [])];
        array[index] = value;
        return { ...prev, [fieldName]: array };
      });
      setIsDirty(true);
    },
    []
  );

  // Agregar item a array
  const addArrayItem = useCallback(
    (fieldName, item = {}) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), item],
      }));
      setIsDirty(true);
    },
    []
  );

  // Remover item de array
  const removeArrayItem = useCallback(
    (fieldName, index) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index),
      }));
      setIsDirty(true);
    },
    []
  );

  // Marcar campo como tocado (para validación en blur)
  const handleBlur = useCallback(
    (fieldName) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      if (validateOnBlur) {
        const fieldError = validateField(fieldName, formData[fieldName]);
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldError,
        }));
      }
    },
    [validateOnBlur, validateField, formData]
  );

  // Validar todo el formulario
  const validateAll = useCallback(() => {
    if (!onValidate) return {};

    const allErrors = onValidate(formData);
    setErrors(allErrors || {});
    return allErrors || {};
  }, [formData, onValidate]);

  // Enviar formulario
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      // Validar antes de enviar
      const validationErrors = validateAll();
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(formData);

          // Reset si es exitoso
          if (resetOnSuccess) {
            setFormData(initialValues);
            setTouched({});
            setIsDirty(false);
          }
        }
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateAll, onSubmit, resetOnSuccess, initialValues]
  );

  // Reset a valores iniciales
  const reset = useCallback(() => {
    setFormData(initialRef.current);
    setTouched({});
    setErrors({});
    setIsDirty(false);
  }, []);

  // Establecer valores manualmente
  const setValues = useCallback((newValues) => {
    setFormData(newValues);
  }, []);

  // Establecer un campo manualmente
  const setFieldValue = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Establecer error manualmente (para errores del servidor)
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  // Obtener error de un campo (solo si fue tocado)
  const getFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] ? errors[fieldName] : null;
    },
    [touched, errors]
  );

  // Utilidad para vincular a inputs <input {...getFieldProps('email')} />
  const getFieldProps = useCallback(
    (fieldName) => ({
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleChange,
      onBlur: () => handleBlur(fieldName),
    }),
    [formData, handleChange, handleBlur]
  );

  return {
    // State
    formData,
    touched,
    errors,
    isDirty,
    isSubmitting,

    // Handlers
    handleChange,
    handleNestedChange,
    handleArrayChange,
    handleBlur,
    handleSubmit,
    getFieldProps,

    // Array methods
    addArrayItem,
    removeArrayItem,

    // Utilities
    reset,
    setValues,
    setFieldValue,
    setFieldError,
    getFieldError,
    validateAll,
    validateField,
  };
};

export default useForm;
