import React, { useState, useEffect } from 'react';
import { getLatestSignosVitalesByAdmisionId, } from '@/services/admisionesSupabaseService';
import GraficoPastelServicio from '../components/GraficoPastelServicio';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { canAccessByRole, getAllowedRolesForDashboardModule } from '@/constants/accessControl';
import { ROLES } from '@/constants/roles';
import { PatientCard, PatientSearchBar, PatientsGrid } from '@/modules/dashboard/components';
import { getStatusColor } from '@/shared/theme/colors';
import {
  getAdmisionesAdmitidas,
  subscribeAdmisionesAdmitidas,
  updateAdmisionById,
} from '@/services/admisionesSupabaseService';
import { supabase } from '@/lib/supabaseClient.js';
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
const MEDICATION_ADMIN_TABLE =
  import.meta.env.VITE_SUPABASE_MEDICATION_ADMIN_TABLE || 'medicamentos_administraciones';
const MEDICATION_REFRESH_INTERVAL_MS = 30000;

function parseHourToMinutes(hour) {
  const text = String(hour || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return Number.POSITIVE_INFINITY;
  }
  return h * 60 + m;
}

const formatMinutesToHour = (minutes) => {
  const safe = ((minutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(safe / 60)).padStart(2, '0');
  const mm = String(safe % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const getMedicationScheduleHours = (item, record = {}) => {
  const baseHour = String(item?.hora_inicio || item?.horaPrimeraToma || '').trim();
  const nextHour = String(item?.proxima_toma || item?.proximaToma || '').trim();
  const interval = Number(item?.intervalo_horas || 0);
  const hasInterval = Number.isFinite(interval) && interval > 0;
  const generated = new Set();
  [baseHour, nextHour]
    .filter((hour) => hour && hour !== '--')
    .forEach((hour) => generated.add(hour));

  if (hasInterval) {
    const startMin = parseHourToMinutes(baseHour);
    const nextMin = parseHourToMinutes(nextHour);
    const maxSteps = Math.max(1, Math.ceil(24 / interval));
    if (Number.isFinite(startMin)) {
      for (let i = 1; i <= maxSteps; i += 1) {
        generated.add(formatMinutesToHour(startMin + i * interval * 60));
      }
    }
    if (Number.isFinite(nextMin)) {
      for (let i = 1; i <= maxSteps; i += 1) {
        generated.add(formatMinutesToHour(nextMin + i * interval * 60));
      }
    }
  }

  const hours = [
    ...Array.from(generated),
    ...(Array.isArray(record?.horariosProgramados) ? record.horariosProgramados : []),
    ...Object.keys(record?.administracionesPorHora || {}),
  ]
    .map((hour) => String(hour || '').trim())
    .filter((hour) => hour && hour !== '--');

  return Array.from(new Set(hours)).sort(
    (a, b) => parseHourToMinutes(a) - parseHourToMinutes(b)
  );
};

const toSupabaseError = (error, fallbackMessage) => {
  if (!error) return new Error(fallbackMessage);
  const wrapped = new Error(error.message || fallbackMessage);
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.hint = error.hint;
  return wrapped;
};

const buildMedicationRecordsByKey = (administraciones = []) => {
  const records = {};
  const toMillis = (value) => {
    if (!value) return 0;
    const parsed = value?.toDate ? value.toDate() : new Date(value);
    const time = parsed.getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  (administraciones || []).forEach((row) => {
    const medicationKey = row?.medicamento_id;
    const scheduledHour = String(row?.hora_programada || row?.hora || '').trim();
    if (!medicationKey || !scheduledHour) return;

    if (!records[medicationKey]) {
      records[medicationKey] = {
        medicationKey,
        horariosProgramados: [],
        administracionesPorHora: {},
      };
    }

    const existingHourData = records[medicationKey].administracionesPorHora[scheduledHour];
    const existingTime = toMillis(existingHourData?.confirmationTime);
    const incomingTime = toMillis(row?.timestamp || row?.created_at) || Date.now();

    if (!records[medicationKey].horariosProgramados.includes(scheduledHour)) {
      records[medicationKey].horariosProgramados.push(scheduledHour);
    }

    if (!existingHourData || incomingTime >= existingTime) {
      records[medicationKey].administracionesPorHora[scheduledHour] = {
        confirmada: Boolean(row?.confirmado || row?.estado === 'administrado'),
        confirmationTime: row?.timestamp || row?.created_at || '',
        confirmadoPor: row?.confirmado_por || '',
        estado: row?.estado || (row?.confirmado ? 'administrado' : 'pendiente'),
      };
    }
  });

  return records;
};

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
  // ========== DEFINICIÓN DE ESTADOS DE PACIENTES ==========
  const estadosPaciente = {
    'Espera': { color: 'bg-gray-400', text: 'text-gray-700' },
    'Atención': { color: 'bg-blue-500', text: 'text-blue-700' },
    'Terapia Intensiva': { color: 'bg-red-500', text: 'text-red-700' },
    'Alta Médica': { color: 'bg-green-500', text: 'text-green-700' },
    'Procedimiento': { color: 'bg-yellow-500', text: 'text-yellow-700' },
    'Quirófano': { color: 'bg-orange-500', text: 'text-orange-700' },
  };

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
  const names = ['PARTE OPERATORIO'];

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
            const { data: evolutions, error: evolutionsError } = await supabase
              .from('clinical_evolution')
              .select(
                `
                  id,
                  created_at,
                  medicamentos (
                    id,
                    clinical_evolution_id,
                    medicamento,
                    via,
                    frecuencia,
                    hora_inicio,
                    intervalo_horas,
                    proxima_toma,
                    presentacion,
                    administra,
                    cantidad,
                    indicacion,
                    created_at
                  )
                `
              )
              .eq('admision_id', main.id)
              .order('created_at', { ascending: false });

            if (evolutionsError) {
              throw toSupabaseError(
                evolutionsError,
                `No se pudo cargar medicación para ${main.nombre}.`
              );
            }

            const medications = [];
            (evolutions || []).forEach((evolution) => {
              (evolution?.medicamentos || []).forEach((med) => {
                medications.push({
                  ...med,
                  source: 'Registro medicación',
                  clinical_evolution_id:
                    med?.clinical_evolution_id || evolution?.id || null,
                });
              });
            });

            nextPlan[main.id] = medications;

            const { data: administraciones, error: administracionesError } =
              await supabase
                .from(MEDICATION_ADMIN_TABLE)
                .select('*')
                .eq('admision_id', main.id)
                .order('timestamp', { ascending: false });

            if (administracionesError && administracionesError.code !== '42P01') {
              throw toSupabaseError(
                administracionesError,
                `No se pudieron cargar checks de medicación para ${main.nombre}.`
              );
            }

            const recordsByKey = buildMedicationRecordsByKey(administraciones || []);
            nextRecords[main.id] = recordsByKey;
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

    const medicationChannel = supabase
      .channel(`dashboard-medication-${mainIds.join('-')}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinical_evolution' },
        scheduleReload
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medicamentos' },
        scheduleReload
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: MEDICATION_ADMIN_TABLE },
        scheduleReload
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Realtime de medicamentos no disponible. Se usará refresco automático.');
        }
      });

    const intervalId = setInterval(loadMedicationData, MEDICATION_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(medicationChannel);
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

  const sortedMains = [...filteredMains].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return orderAsc ? dateA - dateB : dateB - dateA;
  });

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


  //LOGICA DEL ESTADO PARA ALMACENAR EN FIREBASE SEGUN EL SELECTOR
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
  const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 40;
      const increment = value / (duration / 160);

      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplay(value);
          clearInterval(counter);
        } else {
          setDisplay(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, [value]);

    return <span>{display}</span>;
  };
//++++++++++++++++++++++++++++++++++DINAMISCO PARA LAS KPI +++++++++++++++++++++++++++++++++++++++++++++++++



  const servicioColor = (servicio) => {
    switch (servicio) {
      case 'UCI':
        return 'bg-red-100 text-red-700';
      case 'EMERGENCIA':
        return 'bg-orange-100 text-orange-700';
      case 'HOSPITALIZACION':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  //++++++++++++++++++++++++++++++++++++


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

      const { error } = await supabase.from(MEDICATION_ADMIN_TABLE).insert([payload]);
      if (error) {
        throw toSupabaseError(error, 'No se pudo registrar la administración.');
      }

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
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow p-1"
        >

          <div className="max-w-9xl mx-[0.3rem] flex justify-between items-center">

            <div className="flex-1 ml-[21rem] pointer-events-none select-none text-[#4ea685] font-bold text-3xl text-center">
              RACK HOSPITALARIO
            </div>

            <div className="relative z-20 flex items-center gap-2">
              {isAdminUser && (
                <div className="flex gap-3">
                  <Button
                  title="Ir a Farmacia"
                    onClick={() => navigate('/farmacia')}
                    className="relative z-50 text-white h-10 px-5 rounded-xl bg-[#69c9ba] font-bold hover:bg-[#4ea685] shadow-md"
                  >
                    <Pill className="text-white w-6 h-6 text-[#000000]/60 font-bold" />
                    
                  </Button>
                  <Button
                   title="Ir a Panel Administrativo"
                    onClick={() => navigate('/Panel-Administrativo')}
                    className="relative z-50 h-10 px-5 rounded-xl bg-[#69c9ba] font-bold hover:bg-[#4ea685] shadow-md"
                  >
                    <PanelTopOpen className="text-[#000000]/60 w-6 h-6 " />
                    
                  </Button>
                </div>
              )}
              <div className="text-[0.8rem] text-gray-700 font-medium flex items-right gap-1">
                <User className="w-8 h-8" />
                {profile?.nombre || user?.email || 'Usuario'}<br />
                {role ? ` (${role})` : ''}
              </div>

              <Button
              title="Salir del sistema"
                onClick={handleLogout}
                variant="outline"
                className="h-10 px-5 rounded-xl border-[#69c9ba] bg-[#69c9ba] text-[#000000]/60 font-bold hover:bg-[#4ea685] shadow-md"
              >
                <LogOut className=" w-4 h-4 mr-2 text-[#000000]/60 font-bold" /> Salir
              </Button>

            </div>

          </div>
        </motion.header>
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        <header className="grid grid-cols-3 items-center px-8 py-6 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-sm ">
          {/* IZQUIERDA */}
          <div className="flex flex-col">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Logo"
              className="w-44"
            />
            <span className="text-gray-500 text-sm mt-2 tracking-wide">
              {formatearFechaHora(fechaHoraActual)}
            </span>
          </div>

          {/* CENTRO KPIs */}
          <div className="flex justify-center">
            <div className="flex gap-3">
              {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-30  p-2 rounded-3xl bg-gradient-to-br from-[#e6f6f6] to-white text-[#007e8f] shadow-lg border border-[#bde3e3]"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Ocupación de Camas
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-4xl font-bold text-blue-600">
                    <AnimatedNumber value={camasOcupadas} />
                    <span className="text-lg text-gray-500 font-medium">
                      {' '}
                      / {TOTAL_CAMAS}
                    </span>
                  </div>

                  <div className="text-blue-500 text-sm font-semibold">
                    {porcentajeOcupacion}%
                  </div>
                </div>

                {/* Barra progreso */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentajeOcupacion}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-2 rounded-full ${
                      porcentajeOcupacion > 80
                        ? 'bg-red-500'
                        : porcentajeOcupacion > 60
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-blue-500 rounded-full" />
              </motion.div>
              {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}
              {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}

{/* ++++++++++++++++++++++++++++++++++++++TERAPIA INTENSIVA++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
<motion.div
  whileHover={{ scale: 1.03 }}
  className="relative w-40 p-2 rounded-3xl 
  bg-gradient-to-br from-orange-50 to-white
  shadow-lg border border-orange-100"
>
  <div className="text-xs text-gray-500 uppercase tracking-wider">
    Terapia Intensiva
  </div>

  <div className="flex items-center justify-between mt-3">
    <div className="text-4xl font-bold text-orange-600">
      <AnimatedNumber value={totalTerapiaIntensiva} />
    </div>

    <div className="text-orange-600 text-sm font-semibold">
      Críticos
    </div>
  </div>

  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-orange-500 rounded-b-2xl" />
</motion.div>

{/* ++++++++++++++++++++++++++++++++++++++TERAPIA INTENSIVA++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
              {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ALTAS++++++++++++++++++++++++++++++++++++++++++++ */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-40 p-2 rounded-3xl 
        bg-gradient-to-br from-[#e6f6f6] to-white
        shadow-lg border border-green-100"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Altas Médicas
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-4xl font-bold text-[#008C8C]">
                    <AnimatedNumber value={totalAltasMedicas} />
                  </div>

                  <div className="text-[#008C8C] text-sm font-semibold">
                    + Activas
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[#008C8C] rounded-b-3xl" />
              </motion.div>
{/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ALTAS++++++++++++++++++++++++++++++++++++++++++++ */}
{/* +++++++++++++++++++++++++++++++++++++++++++QUIRÓFANO+++++++++++++++++++++++++++++++++++++++++++++++++ */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-40 p-2 rounded-3xl 
        bg-gradient-to-br from-[#e0f2f2] to-white
        shadow-lg border border-purple-100 "
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  En Quirófano
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-4xl font-bold text-purple-600">
                    <AnimatedNumber value={totalQuirofano} />
                  </div>

                  <div className="text-purple-500 text-sm font-semibold">
                    En proceso
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-purple-500 rounded-full" />
              </motion.div>
            </div>
          </div>

{/* +++++++++++++++++++++++++++++++++++++++++++QUIRÓFANO+++++++++++++++++++++++++++++++++++++++++++++++++ */}

          {/* DERECHA */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-4">
              <Button
                className="text-white h-10 px-5 rounded-xl bg-[#69c9ba] hover:bg-[#595759] shadow-md"
                onClick={() => navigate('/ParteOperatorio')}
              >
                <Activity className="text-white w-4 h-4 mr-2" />
                Parte Operatorio
              </Button>

              <Button
                className=" text-white h-10 px-5 rounded-xl bg-[#69c9ba] hover:bg-[#595759] shadow-md"
                onClick={() => navigate('/admision')}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Admisión
              </Button>
            </div>

            <Input
              type="text"
              placeholder="Buscar paciente o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 rounded-xl border border-gray-300 shadow-sm
      focus:ring-2 focus:ring-[#007e8f]/60"
            />
          </div>
        </header>
        {/* ++++++++++++++++++++++++++++++++++++aqui termibna el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui termina el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}

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
                {sortedMains.map((main, index) => {
                  const patientMedicationRows = getPatientMedicationRows(main.id);
                  const pendingMedicationCount = getPendingMedicationCount(main.id);
                  const estadoActualFila = estados[main.id] || main.estado || 'Atención';
                  const isAltaBloqueada = estadoActualFila === ALTA_MEDICA_ESTADO;
                  const servicioActual = servicios[main.id] || main.servicio || '';
                  const ubicacionTexto = formatUbicacionDashboard(main.ubicacion);

                  return (
                  <motion.tr
                    key={main.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    //cuado ESTA EN UCI SE PONE ROJO LA FILA COMPLETA. Y OTRAS CONDICIONES MAS
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-slate-100 transition-colors`}
                  >


                    {/**Aqui inicia el encabezado del dashboard */}
                    <td className="px-4 py-3 text-center text-[#595759] font-medium bg-[#69c9ba]/20 ">
                      {main.fechaIngreso}
                    </td>

                    {/**Aqui PARA QUE ME DE LA ESTADIA DEL PACIENTE TENGO QUE SUMAR LOS DIAS DESDE QUE INGRESO */}
                    <td className="px-4 py-3 text-center text-[#595759] font-medium "> 
                      {main.estancia} <h1>días</h1>
                    </td>

                    {/*Elgrupo de las personas que estan en mi dashboard traidas directamente de firebase*/}
                    <td className="relative px-4 py-3 bg-[#69c9ba]/20 text-center">
                      <div className="inline-block group cursor-pointer">
                        {/* Nombre */}
                        <span className="text-[#595759] font-bold group-hover:text-[#4ea685] transition">
                          {main.nombre}
                        </span>

                        {/* Tooltip */}
                        <div
                          className="pointer-events-none absolute top-full left-1/2 z-[9999] w-80 -translate-x-1/2 mt-2
        scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 rounded-lg bg-white border border-[#76C4D5]
        shadow-2xl p-4 text-xs text-gray-800"
                        >
                          <p className="font-bold text-[#595759] items-center mb-3 flex items-center gap-1">
                            🩺 SIGNOS VITALES
                          </p>

                        
                           <div className="bg-gradient-to-br from-[#76C4D5]/30 to-[#76C4D5]/30 rounded-lg p-3 text-sm text-gray-700">
                <h3 className="font-semibold text-slate-700 mb-2 text-center">ÚLTIMOS SIGNOS VITALES</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getDynamicResumenVitales(main.id).map((vital) => (
                    <div key={vital.label} className="rounded-md px-2 py-1.5 bg-white text-slate-700 text-center border border-gray-200">
                      <p className="text-[9px] font-semibold uppercase text-[#007e8f]">{vital.label}</p>
                      <p className="text-xs font-bold text-gray-800">{vital.value}</p>
                    </div>
                  ))}
                </div>
              </div>

                          {/* Flechita */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -top-2
          w-3 h-3 bg-white
          border-l border-t border-gray-200
          rotate-45
        "
                          />
                        </div>
                      </div>
                    </td>



                      {/* CEDULA */}
                    <td className="px-4 py-3 text-[#4EA685] font-semibold ">
                      {main.cedula}
                    </td>
                    {/* MEDICO */}
                    <td className="px-4 py-3 text-[#595759] font-medium bg-[#69c9ba]/20">
                      {main.medico}
                    </td>
                    {/* *******************************AQUI es cuadro ventana   *******************************
                     *******************************externa para las alertas indicacion de medicamentos *******************************
                    ********************************************************************************************************** */}

                    <td className="px-4 py-3 text-[#000d5b] relative ">
                      {/* ALERGIAS 1 */}
                      <div className="inline-block group cursor-pointer">
                        <span className="text-gray-900 font-medium group-hover:text-[#007e8f] transition">
                          {main.alergiaIconUno}
                        </span>
                        <div
                          className=" pointer-events-none absolute bottom-full left-1/2 z-50 w-64 -translate-x-[-80px] -translate-y-[-60px] 
        scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-90 transition-all duration-200 rounded-xl bg-white border border-gray-300
        shadow-xl p-3 text-xs text-gray-800"
                        >
                          <p className="font-semibold text-[#007e8f] mb-2 flex items-center gap-1">
                            Alergía a:
                          </p>

                          <ul className="space-y-1/2">
                            <li>{main.alergiaUno}</li>
                          </ul>

                          {/* Flechita */}
                          <div
                            className="absolute left-1 top-full -translate-x-4 -translate-y-10 w-3 h-3 bg-white border-r border-b border-gray-300
                                              rotate-45"
                          />
                        </div>
                      </div>
                      {/* ICONO 2 ANTES ALERGIA  2 AHORA INDICACIONES */}
                      <div className="inline-block group cursor-pointer">
                        <span className="text-gray-900 font-medium group-hover:text-[#007e8f] transition">
                          {main.alergiaIconDos}
                        </span>
                        {/* Tooltip */}
                        <div
                          className=" pointer-events-none absolute bottom-full left-1/2 z-50 w-64 -translate-x-[-80px] -translate-y-[-60px] 
        scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-90 transition-all duration-200 rounded-xl bg-white border border-gray-300
        shadow-xl p-3 text-xs text-gray-800"
                        >
                          

                          <ul className="space-y-1/2">
                            <li>{main.alergiaDos}</li>
                          </ul>

                          {/* Flechita */}
                          <div
                            className="absolute left-1 top-full -translate-x-4 -translate-y-10
                                            w-3 h-3 bg-white border-r border-b border-gray-300
                                              rotate-45"
                          />
                        </div>
                      </div>
                      {/********************************** ICONO 3 ANTES ALERGIA  3 AHORA HORARIO DE MEDICAMENTOS ***********LO DINAMICO DEL HORARIO 6:00PM****************************/}

                      <div
                        key={main.id}
                        className="relative inline-block cursor-pointer"
                        onMouseEnter={() => setShowTooltip(main.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <div className="relative inline-flex items-center justify-center">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
                              pendingMedicationCount > 0
                                ? 'border-red-300 bg-red-100 text-red-700'
                                : 'border-emerald-300 bg-emerald-100 text-emerald-700'
                            }`}
                            title="Horario de medicamentos"
                          >
                            <TimerIcon className="h-4 w-4" />
                          </span>
                          {pendingMedicationCount > 0 ? (
                            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                              {pendingMedicationCount > 9 ? '9+' : pendingMedicationCount}
                            </span>
                          ) : null}
                        </div>

                        {showTooltip === main.id && (
                          <div className="absolute top-full left-1/2 z-[9999] w-80 -translate-x-1/2  
      rounded-lg bg-white border border-[#76C4D5] shadow-2xl p-4 text-xs text-gray-800 pointer-events-auto"
    > <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="font-bold text-[#4EA685]">
                                HORARIO DE MEDICAMENTOS
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isNurseUser
                                    ? 'bg-emerald-100 text-[#595759]'
                                    : 'bg-[#76C4D5]-100 text-[#595759] border border-[#76C4D5]'
                                }`}
                              >
                                {isNurseUser ? 'Checks habilitados (enfermería)' : 'Solo enfermería'}
                              </span>
                            </div>

                            {patientMedicationRows.length === 0 ? (
                              <p className="text-gray-600">
                                Sin medicación pendiente para este paciente.
                              </p>
                            ) : (
                              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                {patientMedicationRows.map((medication) => (
                                  <div
                                    key={medication.id}
                                    className="rounded-lg border border-gray-200 bg-[#76C4D5]/20 px-2 py-2"
                                  >
                                    <p className="font-semibold text-[#595759]">
                                      {medication.medicamento}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {medication.scheduleHours.length === 0 ? (
                                        <span className="text-[10px] text-amber-700">
                                          Sin horas programadas
                                        </span>
                                      ) : (
                                        medication.scheduleHours.map((hour) => {
                                          const hourRecord =
                                            medication.administracionesPorHora?.[hour];
                                          const isCompleted =
                                            Boolean(hourRecord?.confirmada);

                                          return (
                                            <button
                                              type="button"
                                              key={`${medication.id}-${hour}`}
                                              onClick={() =>
                                                handleMedicationHourClick(
                                                  main,
                                                  medication,
                                                  hour
                                                )
                                              }
                                              disabled={!isNurseUser || isCompleted}
                                              className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                                                isCompleted
                                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                  : 'bg-red-100 text-red-700 border border-red-300'
                                              } ${
                                                !isNurseUser
                                                  ? 'cursor-not-allowed opacity-70'
                                                  : 'hover:brightness-95'
                                              }`}
                                              title={
                                                isCompleted
                                                  ? `Registrado por ${hourRecord?.confirmadoPor || 'enfermería'}`
                                                  : isNurseUser
                                                    ? 'Click para registrar administración'
                                                    : 'Solo enfermería puede registrar'
                                              }
                                            >
                                              {hour}
                                            </button>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                           <div className="flex items-center gap-1 mt-2 text-[11px] font-bold">
                              <p className="text-[#595759]">Pendientes:</p>
                                  <p className="text-[#B51414]">{pendingMedicationCount}</p>
                                    </div>

                            {!isNurseUser ? (
                              <p className="mt-1 text-[10px] text-[#595759]/50 font-bold">
                                Solo usuarios de enfermería pueden registrar la medicación.
                              </p>
                            ) : null}

                            {/* Flechita */}
                            <div className="absolute left-6 top-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* ARRIBA AQUI es las alertas de medicacmentos que faltan por dar al paciente *******************************
                     ******************************* TENER QUE CONECTAR CON LA APLICACION MISMA *******************************
                     *******************************MUCHO OJO SE AGRUPA DESDE AQUI HASTA ******************************* */}

                    {/**AQUI AGREGO EL SELECTOR DE ESTADOS DEPENDE DE QUE SE ENCUENTRE EL PACIENTE */}
                    <td className="px-4 py-3 text-center font-medium bg-[#69c9ba]/10">
                      <div className="flex items-center justify-center gap-2">
                        {/* Punto de color */}
                        <span
                          className={`w-3 h-3 rounded-full ${
                            (estadosPaciente[estadoActualFila] || estadosPaciente['Atención'])
                              .color
                          }`}
                        />

                        {/* Selector */}
                        <select
                          value={estadoActualFila}
                          onChange={(e) =>
                            handleEstadoChange(main.id, e.target.value)
                          }
                          disabled={isAltaBloqueada}
                          className={`px-2 py-1 rounded-full text-xs font-semibold bg-[#69c9ba]/50 text-[#000000]/70 transition ${
                            isAltaBloqueada
                              ? 'cursor-not-allowed opacity-100'
                              : 'hover:text-[#000000]'
                          }`}
                        >
                          {Object.keys(estadosPaciente).map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    {/**HASTA AQUI AGREGO EL SELECTOR DE ESTADOS DEPENDE DE QUE SE ENCUENTRE EL PACIENTE */}

                    {/**AGREGAR SELECTOR PARA SERVICIOS*+++++++++++++++++++++++++++++++++++++++++++++**/}
                    <td className="px-4 py-3 text-center font-medium">
                      <div className="flex flex-col items-center">
                        {/* Selector Servicio */}
                        <select
                          value={servicioActual}
                          onChange={(e) =>
                            handleServicioChange(main.id, e.target.value)
                          }
                          disabled={isAltaBloqueada}
                          className={`bg-transparent border-none outline-none font-bold text-[#4ea685] transition ${
                            isAltaBloqueada ? 'cursor-not-allowed opacity-70' : 'hover:text-[#595759]'
                          }`}
                        >
                          {serviciosHospital.map((servicio) => (
                            <option key={servicio} value={servicio}>
                              {servicio}
                            </option>
                          ))}
                        </select>

                        {/* Ubicación debajo del servicio */}
                        <div className="text-[11px] text-gray-500 mt-1 leading-tight hover:text-[#000000]">
                          {ubicacionTexto}
                        </div>
                      </div>
                    </td>
                    {/**AGREGAR SELECTOR PARA SERVICIOS ****++++++++++++++++++++++++++++++++++*******a */}

                    <td className="px-4 py-3 text-[#000d5b] bg-[#69c9ba]/20">
                      {main.seguro}
                    </td>

                    <td className="px-4 py-3 ">
                      <div className="flex justify-center gap-2">
                        {getRenderableModules(main.modulos).map((modulo, idx) => {
                          const hasAccess = userCanAccessModule(modulo);
                          const shouldDisable =
                            UNAUTHORIZED_MODULE_BUTTON_MODE === 'disable' && !hasAccess;

                          return (
                            <Button
                              key={idx}
                              size="icon"
                              variant="outline"
                              disabled={shouldDisable}
                              onClick={() => handleModuleClick(main.id, modulo)}
                              className={`relative rounded-full border-2 shadow-sm bg-white transition ${moduleColors[modulo]} ${
                                shouldDisable
                                  ? 'cursor-not-allowed opacity-40'
                                  : 'hover:bg-gray-100 hover:shadow-md'
                              }`}
                              title={
                                shouldDisable
                                  ? `${modulo} (sin permisos para tu rol)`
                                  : modulo
                              }
                            >
                              {moduleIcons[modulo] || (
                                <FileText className="w-5 h-5" />
                              )}

                              {/**aqui agrego informacion para el mensaje de alerta en mod enfrmeria  */}
                              {modulo === 'Modulo Enfermeria' &&
                                pendingMedicationCount > 0 && (
                                  <span
                                    className="absolute -top-1 -right-1 bg-red-600 text-white 
      text-[10px] w-5 h-5 rounded-full flex items-center justify-center
      alert-pulse"
                                  >
                                    {pendingMedicationCount > 9 ? '9+' : pendingMedicationCount}
                                  </span>
                                )}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Pie de página con paginación */}
      <div className="flex justify-center items-center py-1 bg-white ">
        <div className="flex items-center gap-3">
          <span className="cursor-pointer text-gray-500 text-xl">←</span>
          <span className="px-3 py-1 rounded bg-[#69c9ba] text-white hover:bg-[#4ea685] font-bold cursor-pointer">
            1
          </span>
          <span className="px-3 py-1 rounded hover:bg-gray-200 cursor-pointer text-gray-800">
            2
          </span>
          <span className="px-3 py-1 rounded hover:bg-gray-200 cursor-pointer text-gray-800">
            3
          </span>
          <span className="px-3 py-1 rounded hover:bg-gray-200 cursor-pointer text-gray-800">
            4
          </span>
          <span className="cursor-pointer text-gray-500 text-xl">→</span>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
