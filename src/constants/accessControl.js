import { ALL_ROLES, ROLES } from '@/constants/roles';

export const MODULE_ALLOWED_ROLES = {
  MEDICAL: [ROLES.MEDICO, ROLES.ADMIN],
  NURSING: [ROLES.ENFERMERA, ROLES.ASISTENTE, ROLES.ADMIN],
};

export const DASHBOARD_MODULE_ALLOWED_ROLES = {
  'Modulo Médico': MODULE_ALLOWED_ROLES.MEDICAL,
  'Modulo Enfermeria': MODULE_ALLOWED_ROLES.NURSING,
};

export const ROUTE_ALLOWED_ROLES = {
  DASHBOARD: ALL_ROLES,
  MEDICAL_MODULE: MODULE_ALLOWED_ROLES.MEDICAL,
  MEDICAL_ANESTHESIA: MODULE_ALLOWED_ROLES.MEDICAL,
  NURSING_MODULE: MODULE_ALLOWED_ROLES.NURSING,
};

export function canAccessByRole(role, allowedRoles = ALL_ROLES) {
  return Boolean(role) && allowedRoles.includes(role);
}

export function getAllowedRolesForDashboardModule(moduleName) {
  return DASHBOARD_MODULE_ALLOWED_ROLES[moduleName] ?? ALL_ROLES;
}
