import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ALL_ROLES } from '@/constants/roles';

export async function getUserProfileByUid(uid) {
  if (!uid) {
    throw new Error('UID de usuario no proporcionado.');
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('No existe perfil para este usuario en Firestore.');
  }

  const profile = userSnap.data();
  const normalizedRole = String(profile?.rol || '')
    .trim()
    .toLowerCase();

  if (!normalizedRole || !ALL_ROLES.includes(normalizedRole)) {
    throw new Error('El rol del usuario es inválido o no está configurado.');
  }

  return {
    uid,
    nombre: profile.nombre || '',
    email: profile.email || '',
    rol: normalizedRole,
  };
}
