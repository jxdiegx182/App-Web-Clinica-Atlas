import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient.js';
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

  async function handleSession(session) {
    if (!isMounted) return;

    setLoading(true);

    const user = session?.user;

    if (!user) {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const profileData = await getUserProfileByUid(user.id);

      if (!isMounted) return;

      setUser(user);
      setProfile(profileData);
      setRole(profileData.rol);
    } catch (error) {
      console.error('Error cargando perfil:', error);

      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  // 🔥 1. Cargar sesión inicial
  supabase.auth.getSession().then(({ data }) => {
    handleSession(data.session);
  });

  // 🔥 2. Escuchar cambios
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      handleSession(session);
    }
  );

  return () => {
    isMounted = false;
    listener?.subscription?.unsubscribe();
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
        createdByUid: user?.id,
      });
    },
    [role, user?.id]
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
