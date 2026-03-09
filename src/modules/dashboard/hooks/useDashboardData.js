import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAsync } from '@/shared/hooks';

/**
 * HOOK: useDashboardData
 * Lógica de datos para Dashboard
 * Extrae toda la complejidad del componente
 */
export const useDashboardData = () => {
  const [mains, setMains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados por paciente
  const [states, setStates] = useState({});
  const [nursingAlerts, setNursingAlerts] = useState({});
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Fetch de pacientes en tiempo real
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'mains'),
      orderBy('fechaAdmision', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMains(data);
          initializeStates(data);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Inicializar estados de pacientes
  const initializeStates = useCallback((data) => {
    const newStates = {};
    const newAlerts = {};

    data.forEach((patient) => {
      newStates[patient.id] = patient.estado || 'Atención';
      newAlerts[patient.id] = !!patient.horarioDos; // Alerta si existe horarioDos
    });

    setStates(newStates);
    setNursingAlerts(newAlerts);
  }, []);

  // Actualizar reloj
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filtrar mains por search
  const filteredMains = useCallback(() => {
    if (!searchTerm.trim()) return mains;

    const term = searchTerm.toLowerCase();
    return mains.filter(
      (m) =>
        m.primerNombre?.toLowerCase().includes(term) ||
        m.apellidoPaterno?.toLowerCase().includes(term) ||
        m.cedula?.includes(term) ||
        m.id?.toLowerCase().includes(term)
    );
  }, [mains, searchTerm]);

  // Cambiar estado de paciente
  const updatePatientState = useCallback((patientId, newState) => {
    setStates((prev) => ({ ...prev, [patientId]: newState }));
  }, []);

  return {
    mains: filteredMains(),
    allMains: mains,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    states,
    updatePatientState,
    nursingAlerts,
    currentDateTime,
  };
};

/**
 * HOOK: useDashboardModules
 * Gestiona los módulos disponibles y su visibilidad por rol
 */
export const useDashboardModules = (userRole) => {
  const [visibleModules, setVisibleModules] = useState({});

  useEffect(() => {
    // Lógica para mostrar/ocultar módulos según rol
    // (implementar según tu accessControl)
    setVisibleModules({
      pacientes: true,
      emergencias: userRole === 'admin' || userRole === 'medico',
      reportes: userRole === 'admin',
      estadisticas: true,
    });
  }, [userRole]);

  return { visibleModules };
};
