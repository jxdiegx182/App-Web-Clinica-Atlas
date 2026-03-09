/**
 * SISTEMA DE COLORES - CLÍNICA ATLAS
 * Paleta profesional para aplicaciones médicas
 * Basada en estándares de UI médica y accesibilidad WCAG
 */

// ============================================================================
// COLORES BASE - Escala de grises neutral
// ============================================================================
export const neutral = {
  50: '#fafbfc',   // Fondo muy claro (hover states)
  75: '#f6f7f8',   // Fondo claro
  100: '#f1f3f5',  // Fondo principal
  200: '#e1e5ec',  // Bordes sutiles
  300: '#cbd5df',  // Bordes estándar
  400: '#a9b5c6',  // Placeholders
  500: '#8390a2',  // Texto deshabilitado
  600: '#6b7680',  // Texto secundario
  700: '#4a5361',  // Texto principal
  800: '#2d3547',  // Texto oscuro
  900: '#1a1d29',  // Muy oscuro (backgrounds dark)
};

// ============================================================================
// COLORES PRIMARIOS - Azul profesional
// Inspirado en tu paleta existente (#1E3D5C)
// ============================================================================
export const primary = {
  50: '#f0f7ff',
  100: '#e0effe',
  200: '#c0dffe',
  300: '#8fbffe',
  400: '#4fa1ff',
  500: '#0d6cdb',  // Brand principal - Azul médico
  600: '#1e40af',  // Tu color existente #1E3D5C aproximado
  700: '#1d3a8a',
  800: '#1e3a8a',
  900: '#172554',
};

// ============================================================================
// COLORES DE ESTADO - Para indicadores médicos
// ============================================================================
export const status = {
  // ROJO - Crítico/Emergencia
  critical: {
    light: '#fef2f2',
    lighter: '#fee2e2',
    container: '#fecaca',
    main: '#ef4444',
    dark: '#dc2626',
    darker: '#991b1b',
  },

  // NARANJA - Advertencia/Atención requerida
  warning: {
    light: '#fffbeb',
    lighter: '#fef3c7',
    container: '#fde68a',
    main: '#f59e0b',
    dark: '#d97706',
    darker: '#92400e',
  },

  // ÁMBAR - Pendiente/En proceso
  pending: {
    light: '#fffaf0',
    lighter: '#ffedd5',
    container: '#ffd8a8',
    main: '#fb923c',
    dark: '#ea580c',
    darker: '#7c2d12',
  },

  // VERDE - Estable/Completado
  success: {
    light: '#f0fdf4',
    lighter: '#dcfce7',
    container: '#bbf7d0',
    main: '#22c55e',
    dark: '#16a34a',
    darker: '#145231',
  },

  // AZUL - Información
  info: {
    light: '#eff6ff',
    lighter: '#dbeafe',
    container: '#bfdbfe',
    main: '#3b82f6',
    dark: '#1d4ed8',
    darker: '#1e3a8a',
  },

  // GRIS - Inactivo/Deshabilitado
  disabled: {
    light: '#f9fafb',
    lighter: '#f3f4f6',
    container: '#e5e7eb',
    main: '#d1d5db',
    dark: '#9ca3af',
    darker: '#6b7280',
  },
};

// ============================================================================
// COLORES SEMÁNTICOS - Por comportamiento médico
// ============================================================================
export const semantic = {
  // Estado del paciente
  states: {
    // Emergencia/Crítico
    urgentBg: status.critical.light,
    urgentBorder: status.critical.main,
    urgentText: status.critical.dark,
    urgentIcon: status.critical.main,

    // Pendiente/Requiere atención
    pendingBg: status.warning.light,
    pendingBorder: status.warning.main,
    pendingText: status.warning.dark,
    pendingIcon: status.warning.main,

    // En progreso/Atención
    processingBg: status.pending.light,
    processingBorder: status.pending.main,
    processingText: status.pending.dark,
    processingIcon: status.pending.main,

    // Completado/Estable
    completedBg: status.success.light,
    completedBorder: status.success.main,
    completedText: status.success.dark,
    completedIcon: status.success.main,

    // Información
    infoBg: status.info.light,
    infoBorder: status.info.main,
    infoText: status.info.dark,
    infoIcon: status.info.main,

    // Deshabilitado/Inactivo
    disabledBg: status.disabled.light,
    disabledBorder: status.disabled.container,
    disabledText: status.disabled.dark,
    disabledIcon: status.disabled.main,
  },

  // Componentes UI
  components: {
    // Fondos
    bgPrimary: '#ffffff',
    bgSecondary: neutral[50],
    bgTertiary: neutral[100],
    bgDark: neutral[900],

    // Textos
    textPrimary: neutral[900],
    textSecondary: neutral[700],
    textTertiary: neutral[600],
    textDisabled: neutral[400],
    textInverse: '#ffffff',

    // Bordes
    borderLight: neutral[200],
    borderStandard: neutral[300],
    borderDark: neutral[400],
    borderFocus: primary[500],

    // Overlays
    overlayDark: 'rgba(26, 29, 41, 0.8)',
    overlayLight: 'rgba(255, 255, 255, 0.95)',
  },

  // Sombras medicas (sutiles, profesionales)
  shadows: {
    sm: '0 1px 2px rgba(19, 55, 96, 0.03)',
    md: '0 4px 6px rgba(19, 55, 96, 0.07)',
    lg: '0 10px 15px rgba(19, 55, 96, 0.1)',
    xl: '0 20px 25px rgba(19, 55, 96, 0.15)',
  },
};

// ============================================================================
// BADGES / LABELS - Para módulos médicos
// ============================================================================
export const badges = {
  // Emergencias
  emergency: {
    bg: status.critical.light,
    text: status.critical.dark,
    border: status.critical.container,
    icon: '🚨',
  },

  // Pendiente
  pending: {
    bg: status.warning.light,
    text: status.warning.dark,
    border: status.warning.container,
    icon: '⏳',
  },

  // En proceso
  processing: {
    bg: status.pending.light,
    text: status.pending.dark,
    border: status.pending.container,
    icon: '⚙️',
  },

  // Completado
  completed: {
    bg: status.success.light,
    text: status.success.dark,
    border: status.success.container,
    icon: '✅',
  },

  // Información
  info: {
    bg: status.info.light,
    text: status.info.dark,
    border: status.info.container,
    icon: 'ℹ️',
  },

  // Requerido
  required: {
    bg: status.critical.light,
    text: status.critical.dark,
    border: status.critical.container,
    icon: '⭐',
  },

  // Firma requerida
  signature: {
    bg: status.warning.light,
    text: status.warning.dark,
    border: status.warning.container,
    icon: '✍️',
  },

  // Diario
  daily: {
    bg: status.pending.light,
    text: status.pending.dark,
    border: status.pending.container,
    icon: '📅',
  },
};

// ============================================================================
// MÓDULOS MÉDICOS - Colores específicos por tipo de módulo
// ============================================================================
export const modules = {
  // Emergencia
  emergencia: {
    primary: status.critical.main,
    light: status.critical.light,
    dark: status.critical.dark,
  },

  // Anamnesis
  anamnesis: {
    primary: primary[500],
    light: primary[50],
    dark: primary[700],
  },

  // Evolución
  evolucion: {
    primary: status.pending.main,
    light: status.pending.light,
    dark: status.pending.dark,
  },

  // Consentimientos
  consentimientos: {
    primary: status.warning.main,
    light: status.warning.light,
    dark: status.warning.dark,
  },

  // Examen físico
  examenFisico: {
    primary: primary[500],
    light: primary[50],
    dark: primary[700],
  },

  // Interconsulta
  interconsulta: {
    primary: status.info.main,
    light: status.info.light,
    dark: status.info.dark,
  },

  // Epicrisis
  epicrisis: {
    primary: status.success.main,
    light: status.success.light,
    dark: status.success.dark,
  },

  // Receta
  receta: {
    primary: primary[500],
    light: primary[50],
    dark: primary[700],
  },

  // Certificado
  certificado: {
    primary: primary[500],
    light: primary[50],
    dark: primary[700],
  },

  // Quirófano
  quirofano: {
    primary: status.warning.main,
    light: status.warning.light,
    dark: status.warning.dark,
  },

  // Anestesia
  anestesia: {
    primary: status.critical.main,
    light: status.critical.light,
    dark: status.critical.dark,
  },

  // Cuidados de enfermería
  enfermeria: {
    primary: status.success.main,
    light: status.success.light,
    dark: status.success.dark,
  },

  // Dashboard
  dashboard: {
    primary: primary[500],
    light: primary[50],
    dark: primary[700],
  },
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene la clase de color para un estado
 * @param {string} stateKey - Clave del estado (urgent, pending, completed, etc)
 * @returns {object} - Objeto con bg, text, border
 */
export const getStatusColorClass = (stateKey) => {
  return semantic.states[`${stateKey}Bg`] ? {
    bg: semantic.states[`${stateKey}Bg`],
    text: semantic.states[`${stateKey}Text`],
    border: semantic.states[`${stateKey}Border`],
  } : null;
};

/**
 * Obtiene las clases de color de estado para estados médicos en español
 * @param {string} estado - Estado del paciente (Espera, Atención, Terapia Intensiva, Alta, etc)
 * @returns {string} - Clases Tailwind
 */
export const getStatusColor = (estado) => {
  const estadoLower = estado?.toLowerCase() || '';
  
  const statusMap = {
    'espera': 'bg-gray-100 text-gray-700',
    'atención': 'bg-blue-100 text-blue-700',
    'en atención': 'bg-blue-100 text-blue-700',
    'terapia intensiva': 'bg-red-100 text-red-700',
    'alta médica': 'bg-green-100 text-green-700',
    'procedimiento': 'bg-yellow-100 text-yellow-700',
    'quirófano': 'bg-orange-100 text-orange-700',
    'emergencia': 'bg-red-100 text-red-700',
    'alta': 'bg-gray-300 text-gray-900',
    'serv rx': 'bg-gray-400 text-white',
  };
  
  return statusMap[estadoLower] || 'bg-gray-500 text-white';
};

/**
 * Obtiene un objeto con colores de estado para estados médicos
 * @param {string} estado - Estado del paciente
 * @returns {object} - Objeto con propiedades bg, text, badge, color
 */
export const getStatusColorObject = (estado) => {
  const estadoLower = estado?.toLowerCase() || '';
  
  const statusMap = {
    'espera': {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      badge: '#9ca3af',
      color: '#4b5563',
      icon: '⏳'
    },
    'atención': {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      badge: '#3b82f6',
      color: '#1e40af',
      icon: '🔵'
    },
    'en atención': {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      badge: '#3b82f6',
      color: '#1e40af',
      icon: '🔵'
    },
    'terapia intensiva': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      badge: '#ef4444',
      color: '#dc2626',
      icon: '🔴'
    },
    'alta médica': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      badge: '#22c55e',
      color: '#16a34a',
      icon: '✅'
    },
    'procedimiento': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      badge: '#eab308',
      color: '#ca8a04',
      icon: '⚕️'
    },
    'quirófano': {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      badge: '#f97316',
      color: '#ea580c',
      icon: '🏥'
    },
    'emergencia': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      badge: '#ef4444',
      color: '#dc2626',
      icon: '🚨'
    },
    'alta': {
      bg: 'bg-gray-300',
      text: 'text-gray-900',
      badge: '#6b7280',
      color: '#374151',
      icon: '📋'
    },
    'serv rx': {
      bg: 'bg-gray-400',
      text: 'text-white',
      badge: '#4b5563',
      color: '#1f2937',
      icon: '📝'
    },
  };
  
  return statusMap[estadoLower] || {
    bg: 'bg-gray-500',
    text: 'text-white',
    badge: '#6b7280',
    color: '#374151',
    icon: '❓'
  };
};

/**
 * Obtiene el color de un módulo médico
 * @param {string} moduleName - Nombre del módulo
 * @returns {object} - Objeto con primary, light, dark
 */
export const getModuleColor = (moduleName) => {
  const key = moduleName?.toLowerCase();
  return modules[key] || modules.dashboard;
};

export default {
  neutral,
  primary,
  status,
  semantic,
  badges,
  modules,
  getStatusColorClass,
  getStatusColor,
  getStatusColorObject,
  getModuleColor,
};
