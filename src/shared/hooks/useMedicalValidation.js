/**
 * useMedicalValidation - Hook para validaciones médicas
 * 
 * Validaciones específicas del dominio clínico:
 * - Fechas médicas
 * - Vitales (PA, FC, FR, Temp, Peso, etc)
 * - Cédulas/RUC
 * - Diagnósticos
 */

import { useCallback } from 'react';

// Patrones de validación médica
const PATTERNS = {
  // Cédula ecuatoriana
  cedula: /^\d{10}$/,
  // RUC ecuatoriano
  ruc: /^\d{13}$/,
  // Teléfono
  phone: /^(\+593|0)?[0-9]{9,10}$/,
  // Email
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Número positivo
  positiveNumber: /^\d+(\.\d+)?$/,
};

export const useMedicalValidation = () => {
  // Validar cédula ecuatoriana
  const validateCedula = useCallback((cedula) => {
    if (!cedula) return 'Cédula es requerida';
    if (!PATTERNS.cedula.test(cedula)) return 'Cédula debe tener 10 dígitos';

    // Algoritmo de validación de cédula ecuatoriana
    const digits = cedula.split('').map(Number);
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = digits[i] * coeficientes[i];
      if (valor > 9) valor -= 9;
      suma += valor;
    }

    const digito = (10 - (suma % 10)) % 10;
    if (digito !== digits[9]) return 'Cédula inválida';

    return null;
  }, []);

  // Validar presión arterial
  const validatePressure = useCallback((sys, dias) => {
    const errors = {};

    if (!sys || !dias) {
      if (!sys) errors.sys = 'Presión sistólica requerida';
      if (!dias) errors.dias = 'Presión diastólica requerida';
      return errors;
    }

    const sysNum = parseFloat(sys);
    const diasNum = parseFloat(dias);

    // Validación de rangos médicos
    if (sysNum < 60 || sysNum > 250) {
      errors.sys = 'Sistólica debe estar entre 60-250 mmHg';
    }
    if (diasNum < 40 || diasNum > 160) {
      errors.dias = 'Diastólica debe estar entre 40-160 mmHg';
    }
    if (sysNum <= diasNum) {
      errors.dias = 'Sistólica debe ser mayor que diastólica';
    }

    return errors;
  }, []);

  // Validar frecuencia cardíaca
  const validateHeartRate = useCallback((fc) => {
    if (!fc) return 'Frecuencia cardíaca requerida';

    const fcNum = parseFloat(fc);
    if (fcNum < 40 || fcNum > 200) {
      return 'FC debe estar entre 40-200 lpm';
    }
    return null;
  }, []);

  // Validar temperatura
  const validateTemperature = useCallback((temp) => {
    if (!temp) return 'Temperatura requerida';

    const tempNum = parseFloat(temp);
    if (tempNum < 35 || tempNum > 42) {
      return 'Temperatura debe estar entre 35-42°C';
    }
    return null;
  }, []);

  // Validar saturación de oxígeno
  const validateSpO2 = useCallback((spo2) => {
    if (!spo2) return 'SpO2 requerida';

    const spo2Num = parseFloat(spo2);
    if (spo2Num < 70 || spo2Num > 100) {
      return 'SpO2 debe estar entre 70-100%';
    }
    return null;
  }, []);

  // Validar peso
  const validateWeight = useCallback((weight) => {
    if (!weight) return 'Peso requerido';

    const weightNum = parseFloat(weight);
    if (weightNum < 0.1 || weightNum > 300) {
      return 'Peso debe estar entre 0.1-300 kg';
    }
    return null;
  }, []);

  // Validar talla/altura
  const validateHeight = useCallback((height) => {
    if (!height) return 'Talla requerida';

    const heightNum = parseFloat(height);
    if (heightNum < 40 || heightNum > 250) {
      return 'Talla debe estar entre 40-250 cm';
    }
    return null;
  }, []);

  // Validar frecuencia respiratoria
  const validateRespiratoryRate = useCallback((fr) => {
    if (!fr) return 'FR requerida';

    const frNum = parseFloat(fr);
    if (frNum < 4 || frNum > 60) {
      return 'FR debe estar entre 4-60 respiraciones/min';
    }
    return null;
  }, []);

  // Calcular IMC
  const calculateBMI = useCallback((weight, height) => {
    if (!weight || !height) return null;

    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convertir cm a metros

    const bmi = (w / (h * h)).toFixed(1);

    let category = '';
    if (bmi < 18.5) category = 'Bajo peso';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Sobrepeso';
    else category = 'Obesidad';

    return { value: bmi, category };
  }, []);

  // Validar fecha médica (no puede ser futura)
  const validateMedicalDate = useCallback((date, allowFuture = false) => {
    if (!date) return 'Fecha requerida';

    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!allowFuture && dateObj > today) {
      return 'No puede seleccionar fechas futuras';
    }

    // Validar que no sea muy antigua (más de 120 años)
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 120);

    if (dateObj < maxPastDate) {
      return 'Fecha muy antigua';
    }

    return null;
  }, []);

  // Validar edad calculada
  const validateAge = useCallback((age, minAge = 0, maxAge = 150) => {
    if (age === null || age === undefined) return 'Edad requerida';

    const ageNum = parseInt(age);

    if (ageNum < minAge) {
      return `Edad mínima es ${minAge} años`;
    }
    if (ageNum > maxAge) {
      return `Edad máxima es ${maxAge} años`;
    }

    return null;
  }, []);

  // Calcular edad desde fecha de nacimiento
  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }, []);

  // Validar teléfono ecuatoriano
  const validatePhone = useCallback((phone) => {
    if (!phone) return 'Teléfono requerido';
    if (!PATTERNS.phone.test(phone)) {
      return 'Formato de teléfono inválido';
    }
    return null;
  }, []);

  // Validar email
  const validateEmail = useCallback((email) => {
    if (!email) return 'Email requerido';
    if (!PATTERNS.email.test(email)) {
      return 'Email inválido';
    }
    return null;
  }, []);

  // Validar diagnóstico CIE-10
  const validateDiagnosis = useCallback((diagnosis) => {
    if (!diagnosis || diagnosis.trim() === '') {
      return 'Diagnóstico requerido';
    }
    // Aquí puedes agregar validación más compleja con códigos CIE-10
    return null;
  }, []);

  // Validador genérico para campos requeridos
  const validateRequired = useCallback((value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Este campo es requerido';
    }
    return null;
  }, []);

  return {
    // Validadores
    validateCedula,
    validatePressure,
    validateHeartRate,
    validateTemperature,
    validateSpO2,
    validateWeight,
    validateHeight,
    validateRespiratoryRate,
    validatePhone,
    validateEmail,
    validateDiagnosis,
    validateMedicalDate,
    validateAge,
    validateRequired,

    // Calculadores
    calculateBMI,
    calculateAge,
  };
};

export default useMedicalValidation;
