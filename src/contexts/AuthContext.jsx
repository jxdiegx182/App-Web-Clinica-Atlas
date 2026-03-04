import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { ROLES } from '@/constants/roles';
import { loginWithEmailPassword, logoutUser, registerUserByAdmin } from '@/services/authService';
import { getUserProfileByUid } from '@/services/userService';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const firestoreProfile = await getUserProfileByUid(firebaseUser.uid);

        if (!isMounted) return;

        setUser(firebaseUser);
        setProfile(firestoreProfile);
        setRole(firestoreProfile.rol);
      } catch (error) {
        console.error('Error cargando rol/perfil del usuario:', error);
        await logoutUser();

        if (!isMounted) return;

        setUser(null);
        setProfile(null);
        setRole(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      await loginWithEmailPassword(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setLoading(false);
    }
  }, []);

  const registerUser = useCallback(
    async ({ nombre, email, password, rol }) => {
      if (role !== ROLES.ADMIN) {
        throw new Error('Solo un administrador puede registrar nuevos usuarios.');
      }

      return registerUserByAdmin({
        nombre,
        email,
        password,
        rol,
        createdByUid: user?.uid,
      });
    },
    [role, user?.uid]
  );

  const value = {
    user,
    profile,
    role,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    registerUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
