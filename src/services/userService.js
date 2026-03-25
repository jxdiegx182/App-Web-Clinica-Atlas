import { supabase } from '@/supabaseClient';
import { ALL_ROLES } from '@/constants/roles';

export async function getUserProfileByUid(uid) {
  if (!uid) {
    throw new Error('UID de usuario no proporcionado.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) {
    throw new Error('No existe perfil para este usuario en Supabase.');
  }

  const normalizedRole = String(data?.rol || '')
    .trim()
    .toLowerCase();

  if (!normalizedRole || !ALL_ROLES.includes(normalizedRole)) {
    throw new Error('El rol del usuario es inválido o no está configurado.');
  }

  return {
    uid: data.id,
    nombre: data.nombre || '',
    email: data.email || '',
    rol: normalizedRole,
  };
}