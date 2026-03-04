import { initializeApp, deleteApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { ALL_ROLES } from '@/constants/roles';
import { getFirebaseAuthErrorMessage } from '@/utils/firebaseAuthErrors';

async function ensureSessionPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

export async function loginWithEmailPassword(email, password) {
  try {
    await ensureSessionPersistence();
    return await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    const wrappedError = new Error(getFirebaseAuthErrorMessage(error));
    wrappedError.code = error?.code;
    wrappedError.originalError = error;
    throw wrappedError;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export async function registerUserByAdmin({ nombre, email, password, rol, createdByUid }) {
  if (!ALL_ROLES.includes(rol)) {
    throw new Error('Rol inválido. Usa uno de los roles definidos en el sistema.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = nombre.trim();

  const secondaryApp = initializeApp(
    auth.app.options,
    `admin-create-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizedEmail,
      password
    );
    const newUid = userCredential.user.uid;

    await setDoc(doc(db, 'users', newUid), {
      nombre: normalizedName,
      email: normalizedEmail,
      rol,
      createdAt: serverTimestamp(),
      createdBy: createdByUid || null,
    });

    await signOut(secondaryAuth);

    return {
      uid: newUid,
      email: normalizedEmail,
      nombre: normalizedName,
      rol,
    };
  } catch (error) {
    if (secondaryAuth.currentUser) {
      try {
        await secondaryAuth.currentUser.delete();
      } catch (cleanupError) {
        console.error('No se pudo limpiar el usuario creado en Auth:', cleanupError);
      }
    }

    if (error instanceof Error && !error.code) {
      throw error;
    }

    const wrappedError = new Error(getFirebaseAuthErrorMessage(error));
    wrappedError.code = error?.code;
    wrappedError.originalError = error;
    throw wrappedError;
  } finally {
    await deleteApp(secondaryApp);
  }
}
