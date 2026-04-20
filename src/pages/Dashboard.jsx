import React, { useState, useEffect } from 'react';
import { getLatestSignosVitalesByAdmisionId, } from '@/services/admisionesSupabaseService';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { canAccessByRole, getAllowedRolesForDashboardModule } from '@/constants/accessControl';
import { ROLES } from '@/constants/roles';
import { getStatusColorObject } from '@/shared/theme/colors';
import { VitalsTooltip, MedicationTooltip, PatientRow, DashboardHeader } from '@/modules/dashboard/components';
import {
  getMedicationScheduleHours,
  buildMedicationRecordsByKey,
  getMedicationPlanByAdmisionId,
  getMedicationAdminRecords,
  registerMedicationAdministration,
  subscribeMedicationChanges,
} from '@/services/medicationService';

import {
  getAdmisionesAdmitidas,
  subscribeAdmisionesAdmitidas,
  updateAdmisionById,
} from '@/services/admisionesSupabaseService';
import {
  LogOut,
  User,
  Calendar,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  FileText,
  Activity,
  Pill,
  PanelTopOpen,
  TimerIcon,
  ArrowBigUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ✅ NUEVO: Usar el sistema de colores centralizado
const serviciosHospital = [
  'EMERGENCIA',
  'HOSPITAL DIA',
  'HOSPITALIZACION',
  'UCI',
  'UCI PEDIATRICA',
  'NEONATOLOGÍA',
  'CUIDADO',
];
//'Quirófano',
const UNAUTHORIZED_MODULE_BUTTON_MODE = 'hide'; // 'hide' | 'disable'
const ALTA_MEDICA_ESTADO = 'Alta Médica';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ITEMS_PER_PAGE = 15;
const ESTADOS_OPCIONES = ['Espera', 'Atención', 'Terapia Intensiva', 'Alta Médica', 'Procedimiento', 'Quirófano'];
const MEDICATION_REFRESH_INTERVAL_MS = 30000;

const Dashboard = () => {
  const { user, profile, role, logout } = useAuth(); //USUARIO
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(''); //BUSQUEDA DE TERMINOS
  const [estados, setEstados] = useState({});
  const [servicios, setServicios] = useState({});
  const [mains, setMains] = useState([]);
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date()); //* aqui es la fecha comun*/
  const [vitalSignsByPatient, setVitalSignsByPatient] = useState({}); // Signos vitales por paciente
  const [showTooltip, setShowTooltip] = useState(null);
  const [medicationPlanByPatient, setMedicationPlanByPatient] = useState({});
  const [medicationRecordsByPatient, setMedicationRecordsByPatient] = useState({});

  const parseDateValue = (value) => {
    if (!value) return null;
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatUbicacionDashboard = (ubicacion) => {
    if (!ubicacion || typeof ubicacion !== 'object') return '(Sin ubicación)';
    const parts = [];
    if (ubicacion.habitacion) parts.push(String(ubicacion.habitacion));
    if (ubicacion.piso) parts.push(`Piso ${ubicacion.piso}`);
    if (!parts.length) return '(Sin ubicación)';
    return `(${parts.join(' | ')})`;
  };
  // ========== COLORES DE ESTADO — desde sistema centralizado ==========

  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHoraActual(new Date());
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval);
  }, []);

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

  {
    /* aqui la fecha como en atlas*/
  }
  const formatearFechaHora = (fecha) => {
    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(fecha);
  };
  {
    /*IMAGENES EN LOS MODULOS */
  }
  const moduleIcons = {
    'Modulo Médico': (
      <img
        src="https://cdn-icons-png.flaticon.com/512/3143/3143629.png"
        alt="Ícono Médico"
        className="w-9 h-9 object-contain"
      />
    ),

    'Modulo Examenes': (
      <img
        src="https://cdn-icons-png.freepik.com/512/2634/2634023.png"
        alt="Ícono Médico"
        className="w-9 h-9 object-contain"
      />
    ),

    'Modulo Facturación': (
      <img
        src="https://cdn-icons-png.flaticon.com/512/5015/5015593.png"
        alt="Ícono Médico"
        className="w-9 h-9 object-contain"
      />
    ),

    'Modulo Enfermeria': (
      <img
        src="https://images.icon-icons.com/807/PNG/512/nurse-1_icon-icons.com_66066.png"
        alt="Ícono Médico"
        className="w-9 h-9 object-contain"
      />
    ),
  };


  const moduleColors = {
    'Modulo Médico': 'border-blue-400 text-blue-500',
    'Modulo Enfermeria': 'border-blue-400 text-blue-500',
    'Modulo Examenes': 'border-blue-400 text-blue-500',
    'Modulo Facturación': 'border-blue-400 text-blue-500',
    'Parte Operatorio': 'border-blue-400 text-blue-500',
  };

  //+++++++++++++++++++++++++++++++++++++++
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
        modulos: [
          'Modulo Médico',
          'Modulo Enfermeria',
          'Modulo Examenes',
          'Modulo Facturación',
        ],
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
            console.error(
              `❌ Error cargando plan/registro de medicación para ${main.nombre}:`,
              error
            );
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

    const removeChannel = subscribeMedicationChanges(
      `dashboard-medication-${mainIds.join('-')}`,
      scheduleReload
    );

    const intervalId = setInterval(loadMedicationData, MEDICATION_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      removeChannel();
    };
  }, [mains]);

  //+++++++++++agregado por chat gpt 5 ++++++++++++++++++++++++++++

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has salido del sistema correctamente',
    });
    navigate('/login');
  };
  {
    /*_________constantes para REDIRIGIR A LA VENTANA____________________*/
  }
  const handleModuleClick = (mainId, moduleName) => {
    const hasAccess = canAccessByRole(
      role,
      getAllowedRolesForDashboardModule(moduleName)
    );

    if (!hasAccess) {
      navigate('/unauthorized');
      return;
    }

    if (moduleName === 'Modulo Médico') {
      navigate(`/modulo-medico/${mainId}`, { state: { moduleName } });
    } else if (moduleName === 'Modulo Enfermeria') {
      navigate(`/modulo-enfermeria/${mainId}`, { state: { moduleName } });
    } else if (moduleName === 'Parte operatorio') {
      navigate(`/modulo-quirofano/${mainId}`, { state: { moduleName } });
    } else {
      toast({ title: '🚧 Esta función no está implementada aún.' });
    }
  };

  const userCanAccessModule = (moduleName) =>
    canAccessByRole(role, getAllowedRolesForDashboardModule(moduleName));

  const getRenderableModules = (modules = []) => {
    if (UNAUTHORIZED_MODULE_BUTTON_MODE === 'hide') {
      return modules.filter((moduleName) => userCanAccessModule(moduleName));
    }

    return modules;
  };

  const visibleMains = mains.filter((main) => {
    const estadoActual = estados[main.id] || main.estado || 'Atención';
    if (estadoActual !== ALTA_MEDICA_ESTADO) return true;

    const referenciaAlta = parseDateValue(main.createdAt);

    if (!referenciaAlta) return true;
    return fechaHoraActual.getTime() - referenciaAlta.getTime() < ONE_DAY_MS;
  });

  //BUSQUEDA
  const filteredMains = visibleMains.filter(
    (main) =>
      main.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || //busqueda
      main.cedula.includes(searchTerm) ||
      main.medico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //ORDEN ASCENDENTE O DESCENDENTE
  const [orderAsc, setOrderAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedMains = [...filteredMains].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return orderAsc ? dateA - dateB : dateB - dateA;
  });

  // PAGINACIÓN
  const totalPages = Math.max(1, Math.ceil(sortedMains.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMains = sortedMains.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // 🔥 CONTADOR ALTAS MÉDICAS
  //+++++++++++++++++++++++++++++++++
  const totalAltasMedicas = visibleMains.filter(
    (m) => (estados[m.id] || m.estado) === ALTA_MEDICA_ESTADO
  ).length;
  // 🔥 CONTADOR ALTAS MÉDICAS++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++contador de camas gpt5
  const TOTAL_CAMAS = 60;

  const camasOcupadas = visibleMains.filter((m) => (estados[m.id] || m.estado) !== ALTA_MEDICA_ESTADO).length;

  const camasDisponibles = TOTAL_CAMAS - camasOcupadas;

  const porcentajeOcupacion = Math.round((camasOcupadas / TOTAL_CAMAS) * 100);
  //+++++++++++++++++++++++++++++++++++++++++++++

  // 🔥 CONTADOR QUIRÓFANO (TIEMPO REAL)
  const totalQuirofano = visibleMains.filter((m) => (estados[m.id] || m.estado) === 'Quirófano').length;

  //++++++++++++++++++++++++++++++++++++
  //+++++++++CONTADOR DE TERAPIA INTENISVA ++++++++++++++
  // 🔥 CONTADOR TERAPIA INTENSIVA (TIEMPO REAL)
  const totalTerapiaIntensiva = visibleMains.filter(
    (m) =>
      (estados[m.id] || m.estado) === 'Terapia Intensiva' //||
    // m.servicio === 'UCI' ||
    //m.servicio === 'UCI PEDIATRICA'
  ).length;
  //+++++++++++++++++++++++++++++TERAPIA INTENISVA CONTADOR ++++++++++++++++++++


  //LOGICA DEL ESTADO PARA ALMACENAR EN SUPABASE SEGUN EL SELECTOR
  const handleEstadoChange = async (mainId, nuevoEstado) => {
    try {
      const targetPatient = mains.find((item) => item.id === mainId);
      if (!targetPatient) return;

      const estadoActual = estados[mainId] || targetPatient.estado || 'Atención';

      // Regla: Alta Médica queda bloqueada y no acepta más cambios.
      if (estadoActual === ALTA_MEDICA_ESTADO && nuevoEstado !== ALTA_MEDICA_ESTADO) {
        toast({
          title: 'Estado bloqueado',
          description: 'El paciente está en "Alta Médica" y ya no permite cambios.',
          variant: 'destructive',
        });
        return;
      }

      if (estadoActual === nuevoEstado) return;

      // 1️⃣ Actualiza UI
      setEstados((prev) => ({
        ...prev,
        [mainId]: nuevoEstado,
      }));

      // 2️⃣ Actualiza Supabase
      const updatedMainData = {
        ...(targetPatient?.mainData || {}),
        estado: nuevoEstado,
      };
      await updateAdmisionById(mainId, {
        mainData: updatedMainData,
      });

      toast({
        title: 'Estado actualizado',
        description: `Estado cambiado a "${nuevoEstado}"`,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el estado',
        variant: 'destructive',
      });
    }
  };

  //AQUI AGREGO EL SERVICIO CON
  //LA MISMA LOGICA DE LA PARTE DE AQRRIVA DEL ESTADO
  const handleServicioChange = async (mainId, nuevoServicio) => {
    try {
      const targetPatient = mains.find((item) => item.id === mainId);
      if (!targetPatient) return;
      const estadoActual = estados[mainId] || targetPatient.estado || 'Atención';
      if (estadoActual === ALTA_MEDICA_ESTADO) {
        toast({
          title: 'Registro bloqueado',
          description: 'No se puede modificar servicio cuando el paciente está en "Alta Médica".',
          variant: 'destructive',
        });
        return;
      }

      // 1️⃣ UI inmediata
      setServicios((prev) => ({
        ...prev,
        [mainId]: nuevoServicio,
      }));

      // 2️⃣ Supabase
      const updatedMainData = {
        ...(targetPatient?.mainData || {}),
        servicio: nuevoServicio,
      };
      await updateAdmisionById(mainId, {
        mainData: updatedMainData,
      });

      toast({
        title: 'Servicio actualizado',
        description: `Servicio cambiado a "${nuevoServicio}"`,
      });
    } catch (error) {
      console.error('Error al actualizar servicio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el servicio',
        variant: 'destructive',
      });
    }
  };
  //*************************** //✔ Misma lógica ✔ Mismo patrón ✔ Cero sorpresas****************************** */

  //++++++++++++++++++++++++++++++++++++++chat gpt++++++++++++++++++++++++++++++++






  const resumenVitales = [
    { label: 'P.A.', value: '--' },
    { label: 'PULSO', value: '-- lpm' },
    { label: 'TEMP.', value: '-- C' },
    { label: 'SAT O2', value: '--%' },
    { label: 'PESO', value: '-- KG' },
    { label: 'F.R.', value: '--/min' },
  ];

  // 🆕 Cargar últimos signos vitales desde Supabase para cada paciente
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
              console.error(`❌ Error cargando signos vitales para ${main.nombre}:`, error);
              return [main.id, null];
            }
          })
        );

        if (!active) return;

        const nextVitals = {};
        vitalsEntries.forEach(([mainId, latestVital]) => {
          if (latestVital) {
            nextVitals[mainId] = latestVital;
          }
        });

        setVitalSignsByPatient(nextVitals);
      } catch (error) {
        console.error('❌ Error cargando últimos signos vitales desde Supabase:', error);
      }
    };

    loadLatestVitalSigns();

    return () => {
      active = false;
    };
  }, [mains]);




  // 🆕 Generar dinámicamente el resumen vitales desde Supabase
  const getDynamicResumenVitales = (mainId) => {
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

    return resumenVitales; // Fallback a valores por defecto
  };

  const isNurseUser = role === ROLES.ENFERMERA;
  const isAdminUser = role === ROLES.ADMIN;

  const getPatientMedicationRows = (mainId) => {
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
          confirmationTime:
            hourRecord?.confirmationTime || record?.confirmationTime || '',
          confirmadoPor: hourRecord?.confirmadoPor || record?.confirmadoPor || '',
        };
      });

      return {
        ...item,
        scheduleHours,
        administracionesPorHora,
      };
    });
  };

  const getPendingMedicationCount = (mainId) =>
    getPatientMedicationRows(mainId).reduce((acc, item) => {
      const pendingByHour = item.scheduleHours.filter(
        (hour) => !item.administracionesPorHora?.[hour]?.confirmada
      ).length;
      return acc + pendingByHour;
    }, 0);

  const handleMedicationHourClick = async (main, medicationItem, hour) => {
    if (!isNurseUser) {
      toast({
        title: 'Acceso restringido',
        description: 'Solo el personal de enfermería puede registrar la medicación.',
        variant: 'destructive',
      });
      return;
    }

    const currentRecord = medicationRecordsByPatient[main.id]?.[medicationItem.id] || {};
    const currentHourRecord = currentRecord?.administracionesPorHora?.[hour];
    if (currentHourRecord?.confirmada) {
      toast({
        title: 'Ya registrado',
        description: `La enfermera ${currentHourRecord.confirmadoPor || 'de turno'} ya registró ${medicationItem.medicamento} a las ${hour}.`,
      });
      return;
    }

    const nurseName = profile?.nombre || user?.email || 'Enfermería';
    const now = new Date();
    const nowIso = now.toISOString();
    const nowHour = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const scheduleHours = getMedicationScheduleHours(medicationItem, currentRecord);
    const optimisticAdministraciones = {
      ...(currentRecord?.administracionesPorHora || {}),
      [hour]: {
        confirmada: true,
        confirmationTime: nowIso,
        confirmadoPor: nurseName,
        estado: 'administrado',
      },
    };

    setMedicationRecordsByPatient((prev) => ({
      ...prev,
      [main.id]: {
        ...(prev[main.id] || {}),
        [medicationItem.id]: {
          ...(prev[main.id]?.[medicationItem.id] || {}),
          medicationKey: medicationItem.id,
          medicamento: medicationItem.medicamento,
          hora_inicio: medicationItem.hora_inicio || '',
          proxima_toma: medicationItem.proxima_toma || '',
          intervalo_horas: medicationItem.intervalo_horas || '',
          source: medicationItem.source || 'Registro medicación',
          horariosProgramados: scheduleHours,
          administracionesPorHora: optimisticAdministraciones,
        },
      },
    }));

    try {
      const payload = {
        admision_id: main.id,
        medicamento_id: medicationItem.id,
        hora_programada: hour,
        hora: nowHour,
        confirmado: true,
        confirmado_por: nurseName,
        estado: 'administrado',
        timestamp: nowIso,
        created_at: nowIso,
      };

      await registerMedicationAdministration(payload);

      toast({
        title: 'Registro de medicación',
        description: `La enfermera ${nurseName} registró ${medicationItem.medicamento} a las ${hour}.`,
      });
    } catch (error) {
      console.error('❌ Error registrando medicación desde dashboard:', error);
      setMedicationRecordsByPatient((prev) => ({
        ...prev,
        [main.id]: {
          ...(prev[main.id] || {}),
          [medicationItem.id]: {
            ...(prev[main.id]?.[medicationItem.id] || {}),
            medicationKey: medicationItem.id,
            medicamento: medicationItem.medicamento,
            hora_inicio: medicationItem.hora_inicio || '',
            proxima_toma: medicationItem.proxima_toma || '',
            intervalo_horas: medicationItem.intervalo_horas || '',
            source: medicationItem.source || 'Registro medicación',
            horariosProgramados: scheduleHours,
            administracionesPorHora: {
              ...(prev[main.id]?.[medicationItem.id]?.administracionesPorHora || {}),
              [hour]: {
                confirmada: false,
                confirmationTime: '',
                confirmadoPor: '',
                estado: 'pendiente',
              },
            },
          },
        },
      }));
      toast({
        title: 'Error',
        description:
          error?.message || 'No se pudo registrar la medicación.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Clínica Atlas</title>
      </Helmet>

      <div className="min-h-screen w-full bg-gradient-to-br from-white via-[#f0f7f7] to-[#d9eeee]">
        <DashboardHeader
          isAdminUser={isAdminUser}
          profile={profile}
          user={user}
          role={role}
          handleLogout={handleLogout}
          fechaHoraActual={fechaHoraActual}
          camasOcupadas={camasOcupadas}
          TOTAL_CAMAS={TOTAL_CAMAS}
          porcentajeOcupacion={porcentajeOcupacion}
          totalTerapiaIntensiva={totalTerapiaIntensiva}
          totalAltasMedicas={totalAltasMedicas}
          totalQuirofano={totalQuirofano}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className=" max-w-full p-6 pb-72  ">
          <Card className="border-3 border-[#76c4d5]/90 shadow-lg rounded-xl overflow-visible ">
            <table className="w-full text-sm relative  ">
              <thead className="bg-[#69c9ba] text-white uppercase text-xs tracking-wider ">
                {/*turqueza encabezado */}
                <tr>
                  <th className="text-center px-4 py-3 cursor-pointer select-none hover:text-[#595759]"
                    onClick={() => setOrderAsc(!orderAsc)}>

                    <Calendar className="inline w-4 h-4 mr-2" />
                    Fecha Ingreso{' '}
                    <ArrowBigUp className="inline w-4 h-4 mr-2" />

                  </th>
                  <th className="text-left px-4 py-3 hover:text-[#595759]">Estancia</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Paciente</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">HCL</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Médico</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Alertas</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Estado</th>

                  <th className="text-center px-4 py-3 hover:text-[#595759]">Servicio</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Seguro</th>
                  <th className="text-center px-4 py-3 hover:text-[#595759]">Módulos</th>
                </tr>
              </thead>

              {/*Elgrupo para leer datos de las citas*/}
              <tbody>
                {paginatedMains.map((main, index) => {
                  const patientMedicationRows = getPatientMedicationRows(main.id);
                  const pendingMedicationCount = getPendingMedicationCount(main.id);
                  const estadoActualFila = estados[main.id] || main.estado || 'Atención';
                  const isAltaBloqueada = estadoActualFila === ALTA_MEDICA_ESTADO;
                  const servicioActual = servicios[main.id] || main.servicio || '';
                  const ubicacionTexto = formatUbicacionDashboard(main.ubicacion);

                  return (
                    <PatientRow
                      key={main.id}
                      main={main}
                      index={index}
                      estadoActualFila={estadoActualFila}
                      isAltaBloqueada={isAltaBloqueada}
                      servicioActual={servicioActual}
                      ubicacionTexto={ubicacionTexto}
                      vitales={getDynamicResumenVitales(main.id)}
                      patientMedicationRows={patientMedicationRows}
                      pendingMedicationCount={pendingMedicationCount}
                      showTooltip={showTooltip}
                      setShowTooltip={setShowTooltip}
                      isNurseUser={isNurseUser}
                      handleMedicationHourClick={handleMedicationHourClick}
                      handleEstadoChange={handleEstadoChange}
                      handleServicioChange={handleServicioChange}
                      getRenderableModules={getRenderableModules}
                      userCanAccessModule={userCanAccessModule}
                      handleModuleClick={handleModuleClick}
                      moduleColors={moduleColors}
                      moduleIcons={moduleIcons}
                      ESTADOS_OPCIONES={ESTADOS_OPCIONES}
                      serviciosHospital={serviciosHospital}
                      UNAUTHORIZED_MODULE_BUTTON_MODE={UNAUTHORIZED_MODULE_BUTTON_MODE}
                    />
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Pie de página con paginación */}
      <div className="flex justify-center items-center py-2 bg-white gap-4">
        <span className="text-sm text-gray-500">
          {sortedMains.length} paciente{sortedMains.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded font-bold text-sm transition ${
                page === safePage
                  ? 'bg-[#69c9ba] text-white shadow'
                  : 'hover:bg-gray-200 text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;