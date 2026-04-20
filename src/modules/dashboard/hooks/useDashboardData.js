import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { canAccessByRole, getAllowedRolesForDashboardModule } from '@/constants/accessControl';
import { ROLES } from '@/constants/roles';

import {
  getAdmisionesAdmitidas,
  subscribeAdmisionesAdmitidas,
  updateAdmisionById,
  getLatestSignosVitalesByAdmisionId,
} from '@/services/admisionesSupabaseService';

import {
  getMedicationPlanByAdmisionId,
  getMedicationAdminRecords,
  registerMedicationAdministration,
  subscribeMedicationChanges,
  buildMedicationRecordsByKey,
  getMedicationScheduleHours,
} from '@/services/medicationService';

export const ALTA_MEDICA_ESTADO = 'Alta Médica';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ITEMS_PER_PAGE = 15;
const MEDICATION_REFRESH_INTERVAL_MS = 30000;
const TOTAL_CAMAS = 60;

const parseDateValue = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const useDashboardData = () => {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [estados, setEstados] = useState({});
  const [servicios, setServicios] = useState({});
  const [mains, setMains] = useState([]);
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date());
  const [vitalSignsByPatient, setVitalSignsByPatient] = useState({});
  const [showTooltip, setShowTooltip] = useState(null);
  const [medicationPlanByPatient, setMedicationPlanByPatient] = useState({});
  const [medicationRecordsByPatient, setMedicationRecordsByPatient] = useState({});
  const [orderAsc, setOrderAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const isNurseUser = role === ROLES.ENFERMERA;
  const isAdminUser = role === ROLES.ADMIN;

  // Actualizar reloj local
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar lista principal de admisiones
  useEffect(() => {
    const mapAdmisionToMain = (row) => {
      const main = row?.mainData || {};
      const createdDate = parseDateValue(row?.createdAt);
      const hasValidDate = Boolean(createdDate);
      const today = new Date();
      const estancia = hasValidDate
        ? Math.floor((today - createdDate) / (1000 * 60 * 60 * 24) + 1)
        : 0;

      return {
        id: row.id,
        mainData: main,
        createdAt: row?.createdAt || null,
        fechaIngreso: hasValidDate ? createdDate.toLocaleDateString() : '',
        estancia,
        hora: hasValidDate ? createdDate.toLocaleTimeString() : '',
        nombre: `${main.firstName ?? ''} ${main.lastName ?? ''}`.trim(),
        cedula: main.cedula ?? '',
        medico: main.medico ?? '',
        alergiaUno: main.alergiaUno ?? '',
        alergiaDos: main.alergiaDos ?? '',
        alergiaTres: main.alergiaTres ?? '',
        alergiaIconUno: main.alergiaIconUno ?? '',
        alergiaIconDos: main.alergiaIconDos ?? '',
        alergiaIconTres: main.alergiaIconTres ?? '',
        horarioDos: main.horarioDos ?? '',
        horarioTres: main.horarioTres ?? '',
        especialidad: 'General',
        estado: main.estado || 'Atención',
        seguro: main.seguro ?? '',
        servicio: main.servicio ?? '',
        ubicacion: main.ubicacion ?? {},
        telefono: main.phone ?? '',
        modulos: ['Modulo Médico', 'Modulo Enfermeria', 'Modulo Examenes', 'Modulo Facturación'],
      };
    };

    const loadInitial = async () => {
      try {
        const rows = await getAdmisionesAdmitidas();
        setMains(rows.map(mapAdmisionToMain));
      } catch (error) {
        console.error('Error cargando admisiones desde Supabase:', error);
      }
    };

    loadInitial();
    const unsubscribe = subscribeAdmisionesAdmitidas(
      (rows) => setMains(rows.map(mapAdmisionToMain)),
      (error) => console.error('Error realtime admisiones Supabase:', error)
    );
    return () => unsubscribe();
  }, []);

  // Inicializar estados internos UI cuando cargan los pacientes
  useEffect(() => {
    const estadosIniciales = {};
    const serviciosIniciales = {};
    mains.forEach((m) => {
      estadosIniciales[m.id] = m.estado || 'Atención';
      serviciosIniciales[m.id] = m.servicio || 'EMERGENCIA';
    });
    setEstados(estadosIniciales);
    setServicios(serviciosIniciales);
  }, [mains]);

  // Cargar vitales
  useEffect(() => {
    if (!mains || mains.length === 0) {
      setVitalSignsByPatient({});
      return;
    }
    let active = true;
    const loadLatestVitalSigns = async () => {
      try {
        const vitalsEntries = await Promise.all(
          mains.map(async (main) => {
            try {
              const latestVital = await getLatestSignosVitalesByAdmisionId(main.id);
              return [main.id, latestVital || null];
            } catch (error) {
              return [main.id, null];
            }
          })
        );
        if (!active) return;
        const nextVitals = {};
        vitalsEntries.forEach(([mainId, latestVital]) => {
          if (latestVital) nextVitals[mainId] = latestVital;
        });
        setVitalSignsByPatient(nextVitals);
      } catch (error) {
        console.error('❌ Error cargando vitales desde Supabase:', error);
      }
    };
    loadLatestVitalSigns();
    return () => { active = false; };
  }, [mains]);

  // Cargar medicacion
  useEffect(() => {
    if (!mains || mains.length === 0) {
      setMedicationPlanByPatient({});
      setMedicationRecordsByPatient({});
      return;
    }
    let isMounted = true;
    const mainIds = mains.map((main) => main.id);
    let refreshTimeout = null;

    const loadMedicationData = async () => {
      const nextPlan = {};
      const nextRecords = {};
      await Promise.all(
        mains.map(async (main) => {
          try {
            nextPlan[main.id] = await getMedicationPlanByAdmisionId(main.id);
            const administraciones = await getMedicationAdminRecords(main.id);
            nextRecords[main.id] = buildMedicationRecordsByKey(administraciones);
          } catch (error) {
            nextPlan[main.id] = [];
            nextRecords[main.id] = {};
          }
        })
      );
      if (!isMounted) return;
      setMedicationPlanByPatient(nextPlan);
      setMedicationRecordsByPatient(nextRecords);
    };

    const scheduleReload = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        loadMedicationData();
      }, 250);
    };

    loadMedicationData();
    const removeChannel = subscribeMedicationChanges(`dashboard-medication-${mainIds.join('-')}`, scheduleReload);
    const intervalId = setInterval(loadMedicationData, MEDICATION_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      removeChannel();
    };
  }, [mains]);

  // Filtrado y procesamiento local
  const visibleMains = mains.filter((main) => {
    const estadoActual = estados[main.id] || main.estado || 'Atención';
    if (estadoActual !== ALTA_MEDICA_ESTADO) return true;
    const referenciaAlta = parseDateValue(main.createdAt);
    if (!referenciaAlta) return true;
    return fechaHoraActual.getTime() - referenciaAlta.getTime() < ONE_DAY_MS;
  });

  const filteredMains = visibleMains.filter(
    (main) =>
      main.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      main.cedula.includes(searchTerm) ||
      main.medico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMains = [...filteredMains].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return orderAsc ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.max(1, Math.ceil(sortedMains.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMains = sortedMains.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // KPIs
  const totalAltasMedicas = visibleMains.filter(
    (m) => (estados[m.id] || m.estado) === ALTA_MEDICA_ESTADO
  ).length;
  const camasOcupadas = visibleMains.filter(
    (m) => (estados[m.id] || m.estado) !== ALTA_MEDICA_ESTADO
  ).length;
  const porcentajeOcupacion = Math.round((camasOcupadas / TOTAL_CAMAS) * 100);
  const totalQuirofano = visibleMains.filter(
    (m) => (estados[m.id] || m.estado) === 'Quirófano'
  ).length;
  const totalTerapiaIntensiva = visibleMains.filter(
    (m) => (estados[m.id] || m.estado) === 'Terapia Intensiva'
  ).length;

  // Sub-Hooks Funciones:
  const getDynamicResumenVitales = useCallback((mainId) => {
    const patientVitals = vitalSignsByPatient[mainId];
    if (patientVitals) {
      return [
        { label: 'P.A.', value: patientVitals.presion || '--' },
        { label: 'PULSO', value: `${patientVitals.pulso || '--'} lpm` },
        { label: 'TEMP.', value: `${patientVitals.temperatura || '--'} C` },
        { label: 'SAT O2', value: `${patientVitals.satO2 || patientVitals.sat_o2 || '--'}%` },
        { label: 'PESO', value: `${patientVitals.peso || '--'} KG` },
        { label: 'F.R.', value: `${patientVitals.fr || '--'}/min` },
      ];
    }
    return [
      { label: 'P.A.', value: '--' },
      { label: 'PULSO', value: '-- lpm' },
      { label: 'TEMP.', value: '-- C' },
      { label: 'SAT O2', value: '--%' },
      { label: 'PESO', value: '-- KG' },
      { label: 'F.R.', value: '--/min' },
    ];
  }, [vitalSignsByPatient]);

  const getPatientMedicationRows = useCallback((mainId) => {
    const planItems = medicationPlanByPatient[mainId] || [];
    const recordsByKey = medicationRecordsByPatient[mainId] || {};
    const mergedItems = new Map(planItems.map((item) => [item.id, { ...item }]));

    Object.entries(recordsByKey).forEach(([key, record]) => {
      if (!mergedItems.has(key)) {
        mergedItems.set(key, {
          id: key,
          medicamento: record?.medicamento || 'Medicamento',
          hora_inicio: record?.hora_inicio || '--',
          proxima_toma: record?.proxima_toma || '--',
          intervalo_horas: record?.intervalo_horas || '',
          source: record?.source || 'Registro',
        });
      }
    });

    return Array.from(mergedItems.values()).map((item) => {
      const record = recordsByKey[item.id] || {};
      const scheduleHours = getMedicationScheduleHours(item, record);
      const administracionesPorHora = {};

      scheduleHours.forEach((hour) => {
        const hourRecord = record?.administracionesPorHora?.[hour];
        administracionesPorHora[hour] = {
          confirmada: Boolean(
            hourRecord?.confirmada ||
            (record?.confirmada && !record?.administracionesPorHora)
          ),
          confirmationTime: hourRecord?.confirmationTime || record?.confirmationTime || '',
          confirmadoPor: hourRecord?.confirmadoPor || record?.confirmadoPor || '',
        };
      });

      return {
        ...item,
        scheduleHours,
        administracionesPorHora,
      };
    });
  }, [medicationPlanByPatient, medicationRecordsByPatient]);

  const getPendingMedicationCount = useCallback((mainId) => {
    return getPatientMedicationRows(mainId).reduce((acc, item) => {
      const pendingByHour = item.scheduleHours.filter(
        (hour) => !item.administracionesPorHora?.[hour]?.confirmada
      ).length;
      return acc + pendingByHour;
    }, 0);
  }, [getPatientMedicationRows]);

  const handleMedicationHourClick = async (main, medicationItem, hour) => {
    if (!isNurseUser) {
      toast({ title: 'Acceso restringido', description: 'Solo el personal de enfermería puede registrar.', variant: 'destructive' });
      return;
    }

    const currentRecord = medicationRecordsByPatient[main.id]?.[medicationItem.id] || {};
    const currentHourRecord = currentRecord?.administracionesPorHora?.[hour];
    if (currentHourRecord?.confirmada) {
      toast({ title: 'Ya registrado', description: `Ya se registró a las ${hour}.` });
      return;
    }

    const nurseName = profile?.nombre || user?.email || 'Enfermería';
    const now = new Date();
    const nowIso = now.toISOString();
    const nowHour = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    const scheduleHours = getMedicationScheduleHours(medicationItem, currentRecord);
    
    setMedicationRecordsByPatient((prev) => ({
      ...prev,
      [main.id]: {
        ...(prev[main.id] || {}),
        [medicationItem.id]: {
          ...(prev[main.id]?.[medicationItem.id] || {}),
          horariosProgramados: scheduleHours,
          administracionesPorHora: {
            ...(currentRecord?.administracionesPorHora || {}),
            [hour]: { confirmada: true, confirmationTime: nowIso, confirmadoPor: nurseName, estado: 'administrado' },
          },
        },
      },
    }));

    try {
      await registerMedicationAdministration({
        admision_id: main.id,
        medicamento_id: medicationItem.id,
        hora_programada: hour,
        hora: nowHour,
        confirmado: true,
        confirmado_por: nurseName,
        estado: 'administrado',
        timestamp: nowIso,
        created_at: nowIso,
      });
      toast({ title: 'Registro exitoso', description: `Medicación registrada a las ${hour}.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Revertido: no se pudo registrar.', variant: 'destructive' });
      // Aquí se revertiría el optimista re-fetcheando
    }
  };

  const handleEstadoChange = async (mainId, nuevoEstado) => {
    const targetPatient = mains.find((item) => item.id === mainId);
    if (!targetPatient) return;
    const estadoActual = estados[mainId] || targetPatient.estado || 'Atención';

    if (estadoActual === ALTA_MEDICA_ESTADO && nuevoEstado !== ALTA_MEDICA_ESTADO) {
      toast({ title: 'Estado bloqueado', description: 'No se permite cambios en Alta Médica.', variant: 'destructive' });
      return;
    }
    if (estadoActual === nuevoEstado) return;

    setEstados((prev) => ({ ...prev, [mainId]: nuevoEstado }));
    
    try {
      await updateAdmisionById(mainId, { mainData: { ...(targetPatient?.mainData || {}), estado: nuevoEstado } });
      toast({ title: 'Estado actualizado', description: `Estado cambiado a "${nuevoEstado}"` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo guardar el estado', variant: 'destructive' });
    }
  };

  const handleServicioChange = async (mainId, nuevoServicio) => {
    const targetPatient = mains.find((item) => item.id === mainId);
    if (!targetPatient) return;
    const estadoActual = estados[mainId] || targetPatient.estado;
    if (estadoActual === ALTA_MEDICA_ESTADO) {
      toast({ title: 'Bloqueado', description: 'Alta Médica bloqueada.', variant: 'destructive' });
      return;
    }

    setServicios((prev) => ({ ...prev, [mainId]: nuevoServicio }));

    try {
      await updateAdmisionById(mainId, { mainData: { ...(targetPatient?.mainData || {}), servicio: nuevoServicio } });
      toast({ title: 'Servicio actualizado', description: `Servicio "${nuevoServicio}" guardado.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Error guardando servicio', variant: 'destructive' });
    }
  };

  return {
    states: {
      searchTerm,
      estados,
      servicios,
      fechaHoraActual,
      showTooltip,
      orderAsc,
      currentPage,
      totalPages,
      safePage,
      paginatedMains,
      sortedMains,
      visibleMains,
      camasOcupadas,
      TOTAL_CAMAS,
      porcentajeOcupacion,
      totalTerapiaIntensiva,
      totalAltasMedicas,
      totalQuirofano,
      isNurseUser,
      isAdminUser,
    },
    setters: {
      setSearchTerm,
      setShowTooltip,
      setOrderAsc,
      setCurrentPage,
    },
    handlers: {
      handleEstadoChange,
      handleServicioChange,
      handleMedicationHourClick,
      getDynamicResumenVitales,
      getPatientMedicationRows,
      getPendingMedicationCount,
    }
  };
};

export const useDashboardModules = (userRole) => {
  const [visibleModules, setVisibleModules] = useState({});
  useEffect(() => {
    setVisibleModules({
      pacientes: true,
      emergencias: userRole === 'admin' || userRole === 'medico',
      reportes: userRole === 'admin',
      estadisticas: true,
    });
  }, [userRole]);
  return { visibleModules };
};
