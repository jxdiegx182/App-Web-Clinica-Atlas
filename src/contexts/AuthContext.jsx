
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('hospital_auth');
    const savedUser = localStorage.getItem('hospital_user');
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Simulación de autenticación
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'Administrador', name: 'Dr. Admin' },
      { username: 'doctor', password: 'doctor123', role: 'Médico', name: 'Dr. García' },
      { username: 'enfermera', password: 'nurse123', role: 'Enfermera', name: 'Enf. María' }
    ];

    const user = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (user) {
      setIsAuthenticated(true);
      setUser(user);
      localStorage.setItem('hospital_auth', 'true');
      localStorage.setItem('hospital_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('hospital_auth');
    localStorage.removeItem('hospital_user');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
