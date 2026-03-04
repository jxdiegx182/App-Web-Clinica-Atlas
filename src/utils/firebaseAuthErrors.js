const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/missing-password': 'Debes ingresar una contraseña.',
  'auth/invalid-credential': 'Credenciales inválidas. Verifica correo y contraseña.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/user-not-found': 'No existe un usuario con ese correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta nuevamente en unos minutos.',
  'auth/network-request-failed': 'Error de red. Revisa tu conexión e intenta otra vez.',
  'auth/requires-recent-login': 'Debes volver a iniciar sesión para realizar esta acción.',
};

export function getFirebaseAuthErrorMessage(error) {
  const errorCode = error?.code;

  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }

  return 'Ocurrió un error inesperado durante la autenticación.';
}
