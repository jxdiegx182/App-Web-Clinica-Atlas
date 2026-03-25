import { supabase } from '@/supabaseClient';
import { ALL_ROLES } from '@/constants/roles';
import { getFirebaseAuthErrorMessage } from '@/utils/firebaseAuthErrors';

async function ensureSessionPersistence() {
  // Supabase maneja persistencia de sesión automáticamente en el navegador.
  return Promise.resolve();
}

function mapSupabaseAuthCode(error) {
  const rawCode = String(error?.code || '').toLowerCase();
  const rawMessage = String(error?.message || '').toLowerCase();

  if (rawCode.includes('invalid_credentials') || rawMessage.includes('invalid login credentials')) {
    return 'auth/invalid-credential';
  }

  if (rawCode.includes('email_address_invalid') || rawMessage.includes('invalid email')) {
    return 'auth/invalid-email';
  }

  if (
    rawMessage.includes('network') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('fetch failed')
  ) {
    return 'auth/network-request-failed';
  }

  if (
    rawCode.includes('email_exists') ||
    rawCode.includes('user_already_exists') ||
    rawMessage.includes('already registered') ||
    rawMessage.includes('already been registered')
  ) {
    return 'auth/email-already-in-use';
  }

  if (rawCode.includes('weak_password') || rawMessage.includes('password')) {
    return 'auth/weak-password';
  }

  if (
    rawCode.includes('over_request_rate_limit') ||
    rawCode.includes('over_email_send_rate_limit') ||
    rawMessage.includes('too many requests')
  ) {
    return 'auth/too-many-requests';
  }

  return 'auth/invalid-credential';
}

function toWrappedAuthError(error) {
  const normalizedError = {
    ...error,
    code: mapSupabaseAuthCode(error),
  };
  const wrappedError = new Error(getFirebaseAuthErrorMessage(normalizedError));
  wrappedError.code = normalizedError.code;
  wrappedError.originalError = error;
  return wrappedError;
}

export async function loginWithEmailPassword(email, password) {
  try {
    await ensureSessionPersistence();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw toWrappedAuthError(error);
  }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw toWrappedAuthError(error);
  }
}

export async function registerUserByAdmin({ nombre, email, password, rol, createdByUid }) {
  void createdByUid;

  if (!ALL_ROLES.includes(rol)) {
    throw new Error('Rol inválido. Usa uno de los roles definidos en el sistema.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = nombre.trim();

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }

    const newUid = signUpData?.user?.id;

    if (!newUid) {
      throw new Error('No fue posible crear el usuario en Supabase Auth.');
    }

    const { error: profileInsertError } = await supabase.from('users').insert({
      id: newUid,
      nombre: normalizedName,
      email: normalizedEmail,
      rol,
    });

    if (profileInsertError) {
      throw profileInsertError;
    }

    return {
      uid: newUid,
      email: normalizedEmail,
      nombre: normalizedName,
      rol,
    };
  } catch (error) {
    if (error instanceof Error && !error.code) {
      throw error;
    }

    throw toWrappedAuthError(error);
  }
}
