/**
 * TIPOGRAFÍA - CLÍNICA ATLAS
 * Sistema de tipografía consistente y accesible
 */

export const typography = {
  // Familias de fuentes
  fontFamily: {
    base: 'Montserrat, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Fira Code, monospace',
  },

  // Escalas de tamaño
  fontSize: {
    // Pequeños
    xs: { size: '12px', lineHeight: '16px', weight: 400 },
    sm: { size: '14px', lineHeight: '20px', weight: 400 },

    // Base
    base: { size: '16px', lineHeight: '24px', weight: 400 },
    md: { size: '16px', lineHeight: '24px', weight: 500 },

    // Grandes
    lg: { size: '18px', lineHeight: '28px', weight: 500 },
    xl: { size: '20px', lineHeight: '28px', weight: 600 },
    '2xl': { size: '24px', lineHeight: '32px', weight: 600 },
    '3xl': { size: '30px', lineHeight: '36px', weight: 700 },

    // Headings médicos
    h1: { size: '36px', lineHeight: '44px', weight: 700 },
    h2: { size: '28px', lineHeight: '36px', weight: 700 },
    h3: { size: '24px', lineHeight: '32px', weight: 600 },
    h4: { size: '20px', lineHeight: '28px', weight: 600 },
    h5: { size: '18px', lineHeight: '26px', weight: 600 },
    h6: { size: '16px', lineHeight: '24px', weight: 600 },

    // Especiales
    caption: { size: '12px', lineHeight: '16px', weight: 400 },
    label: { size: '14px', lineHeight: '20px', weight: 500 },
    button: { size: '14px', lineHeight: '20px', weight: 600 },
  },

  // Pesos
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Espaciado de letras
  letterSpacing: {
    tight: '-0.5px',
    normal: '0px',
    wide: '0.5px',
    wider: '1px',
  },
};

/**
 * ESPACIADO - Sistema de espaciado consistente
 * Basado en múltiplos de 4px
 */
export const spacing = {
  // Core spacing
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',

  // Padding/Margin presets
  padding: {
    xs: '8px 12px',
    sm: '8px 16px',
    md: '12px 20px',
    lg: '16px 24px',
    xl: '24px 32px',
  },

  gap: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

/**
 * BORDER RADIUS - Radio de bordes consistentes
 */
export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',

  // Medical components
  card: '12px',
  button: '8px',
  input: '8px',
  avatar: '50%',
};

/**
 * SHADOWS - Sombras profesionales para medicina
 */
export const shadows = {
  none: 'none',

  // Sutil
  xs: '0 1px 2px rgba(19, 55, 96, 0.03), 0 1px 1px rgba(19, 55, 96, 0.02)',
  sm: '0 1px 3px rgba(19, 55, 96, 0.1), 0 1px 2px rgba(19, 55, 96, 0.06)',

  // Estándar
  base: '0 4px 6px rgba(19, 55, 96, 0.07), 0 2px 4px rgba(19, 55, 96, 0.05)',
  md: '0 4px 12px rgba(19, 55, 96, 0.08)',

  // Elevado
  lg: '0 10px 15px rgba(19, 55, 96, 0.1), 0 4px 6px rgba(19, 55, 96, 0.05)',
  xl: '0 20px 25px rgba(19, 55, 96, 0.1), 0 10px 10px rgba(19, 55, 96, 0.04)',

  // Muy elevado
  '2xl': '0 25px 50px rgba(19, 55, 96, 0.25)',

  // Focus
  focus: '0 0 0 3px rgba(13, 108, 219, 0.1), 0 0 0 1px rgba(13, 108, 219, 0.5)',

  // Médico - hover
  cardHover: '0 12px 24px rgba(19, 55, 96, 0.12)',

  // Médico - pressed
  cardActive: 'inset 0 2px 4px rgba(19, 55, 96, 0.06)',
};

/**
 * Z-INDEX - Jerarquía de profundidad
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 1090,
};

/**
 * TRANSICIONES - Movimientos suaves
 */
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',

  // Específicas
  colors: 'color 200ms ease-in-out',
  transform: 'transform 200ms ease-in-out',
  all: 'all 200ms ease-in-out',

  // Easing functions
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * BREAKPOINTS - Para responsive design
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export default {
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
};
