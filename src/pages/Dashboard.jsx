import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp,
  updateDoc,
  limit,
} from 'firebase/firestore';
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
  LogOut,
  User,
  Calendar,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  FileText,
  Activity,
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

const MEDICATION_SOURCE_COLLECTIONS = [
  { name: 'prescriptions', label: 'Prescripcion' },
  { name: 'medical_prescriptions', label: 'Prescripcion' },
  { name: 'recetas', label: 'Receta' },
];

const sanitizeMedicationKeyPart = (value) =>
  String(value || 'sin_dato')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'sin_dato';

const buildMedicationKey = (medicamento, horaPrimeraToma, proximaToma) =>
  `${sanitizeMedicationKeyPart(medicamento)}_${sanitizeMedicationKeyPart(horaPrimeraToma)}_${sanitizeMedicationKeyPart(proximaToma)}`;

const normalizeMedicationEntry = (entry, sourceLabel) => {
  const medicamento = String(entry?.medicamento || entry?.nombre || entry?.farmaco || entry?.descripcion || '').trim();
  if (!medicamento) return null;

  const horaPrimeraToma = String(
    entry?.horaPrimeraToma ||
      entry?.horaPrimera ||
      entry?.horaInicial ||
      entry?.hora ||
      entry?.hora_toma ||
      ''
  ).trim();

  const proximaToma = String(
    entry?.proximaToma ||
      entry?.horaProximaToma ||
      entry?.siguienteToma ||
      entry?.hora_proxima ||
      ''
  ).trim();

  return {
    id: buildMedicationKey(medicamento, horaPrimeraToma || '--', proximaToma || '--'),
    medicamento,
    horaPrimeraToma: horaPrimeraToma || '--',
    proximaToma: proximaToma || '--',
    source: sourceLabel,
  };
};

const extractMedicationEntries = (docData, sourceLabel) => {
  const result = [];
  const rawItems = [];

  if (Array.isArray(docData?.medicamentos)) rawItems.push(...docData.medicamentos);
  if (Array.isArray(docData?.prescripciones)) rawItems.push(...docData.prescripciones);
  if (Array.isArray(docData?.items)) rawItems.push(...docData.items);
  if (docData?.medicamento && rawItems.length === 0) rawItems.push(docData);

  rawItems.forEach((item) => {
    const normalized = normalizeMedicationEntry(item, sourceLabel);
    if (normalized) result.push(normalized);
  });

  return result;
};

const getMedicationScheduleHours = (item, record = {}) => {
  const hours = [
    item?.horaPrimeraToma,
    item?.proximaToma,
    ...(Array.isArray(record?.horariosProgramados) ? record.horariosProgramados : []),
    ...Object.keys(record?.administracionesPorHora || {}),
  ]
    .map((hour) => String(hour || '').trim())
    .filter((hour) => hour && hour !== '--');

  return Array.from(new Set(hours));
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
      serviciosIniciales[m.id] = m.servicio || 'Emergencia';
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
    const q = query(
      collection(db, 'admisiones'),
      where('admitido', '==', true),
      orderBy('admittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const admisionesFirebase = snapshot.docs.map((doc) => {
        const data = doc.data();
        const main = data.mainData || {};
        const fechaIngresoDate = data.createdAt?.toDate?.() ?? null;
        const hoy = new Date();

        const estancia = fechaIngresoDate
          ? Math.floor((hoy - fechaIngresoDate) / (1000 * 60 * 60 * 24) + 1)
          : 0;

        return {
          id: doc.id,
          fechaIngreso: data.createdAt?.toDate?.().toLocaleDateString() ?? '',
          estancia,
          hora: data.createdAt?.toDate?.().toLocaleTimeString() ?? '',
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
      });

      setMains(admisionesFirebase);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!mains || mains.length === 0) {
      setMedicationPlanByPatient({});
      setMedicationRecordsByPatient({});
      return;
    }

    let isMounted = true;
    const unsubscribers = [];

    const loadMedicationPlan = async () => {
      const nextPlan = {};

      await Promise.all(
        mains.map(async (main) => {
          const mergedMedications = new Map();

          try {
            const clinicalEvolutionRef = collection(db, 'admisiones', main.id, 'clinical_evolution');
            const clinicalEvolutionQuery = query(clinicalEvolutionRef, orderBy('createdAt', 'desc'), limit(1));
            const clinicalSnapshot = await getDocs(clinicalEvolutionQuery);

            clinicalSnapshot.docs.forEach((docSnap) => {
              const entries = extractMedicationEntries(docSnap.data(), 'Evolucion');
              entries.forEach((entry) => {
                mergedMedications.set(entry.id, entry);
              });
            });
          } catch (error) {
            console.warn(`⚠️ No se pudo cargar evolución de ${main.nombre}`, error);
          }

          const optionalSources = await Promise.allSettled(
            MEDICATION_SOURCE_COLLECTIONS.map((source) =>
              getDocs(query(collection(db, 'admisiones', main.id, source.name), limit(5)))
            )
          );

          optionalSources.forEach((result, index) => {
            if (result.status !== 'fulfilled') return;
            const sourceLabel = MEDICATION_SOURCE_COLLECTIONS[index].label;

            result.value.docs.forEach((docSnap) => {
              const entries = extractMedicationEntries(docSnap.data(), sourceLabel);
              entries.forEach((entry) => {
                const existing = mergedMedications.get(entry.id);
                if (existing) {
                  const sources = new Set([existing.source, sourceLabel]);
                  mergedMedications.set(entry.id, { ...existing, source: Array.from(sources).join(' + ') });
                } else {
                  mergedMedications.set(entry.id, entry);
                }
              });
            });
          });

          nextPlan[main.id] = Array.from(mergedMedications.values());
        })
      );

      if (!isMounted) return;
      setMedicationPlanByPatient(nextPlan);
    };

    loadMedicationPlan();

    mains.forEach((main) => {
      const medicationRecordsRef = collection(db, 'admisiones', main.id, 'medication_records');
      const medicationRecordsQuery = query(medicationRecordsRef, limit(250));
      const unsubscribe = onSnapshot(
        medicationRecordsQuery,
        (snapshot) => {
          setMedicationRecordsByPatient((prev) => {
            const recordsByKey = {};
            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              const key = data.medicationKey || docSnap.id;
              recordsByKey[key] = data;
            });

            return {
              ...prev,
              [main.id]: recordsByKey,
            };
          });
        },
        (error) => {
          console.error(`❌ Error escuchando medication_records de ${main.nombre}:`, error);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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

  //BUSQUEDA
  const filteredMains = mains.filter(
    (main) =>
      main.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || //busqueda
      main.cedula.includes(searchTerm) ||
      main.medico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //ORDEN ASCENDENTE O DESCENDENTE
  const [orderAsc, setOrderAsc] = useState(true);

  const sortedMains = [...filteredMains].sort((a, b) => {
    const dateA = new Date(a.fechaIngreso);
    const dateB = new Date(b.fechaIngreso);
    return orderAsc ? dateA - dateB : dateB - dateA;
  });

  // 🔥 CONTADOR ALTAS MÉDICAS
  //+++++++++++++++++++++++++++++++++
  const totalAltasMedicas = mains.filter(
    (m) => m.estado === 'Alta Médica'
  ).length;
  // 🔥 CONTADOR ALTAS MÉDICAS++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++contador de camas gpt5
  const TOTAL_CAMAS = 60;

  const camasOcupadas = mains.filter((m) => m.estado !== 'Alta Médica').length;

  const camasDisponibles = TOTAL_CAMAS - camasOcupadas;

  const porcentajeOcupacion = Math.round((camasOcupadas / TOTAL_CAMAS) * 100);
  //+++++++++++++++++++++++++++++++++++++++++++++

  // 🔥 CONTADOR QUIRÓFANO (TIEMPO REAL)
  const totalQuirofano = mains.filter((m) => m.estado === 'Quirófano').length;

  //++++++++++++++++++++++++++++++++++++
//+++++++++CONTADOR DE TERAPIA INTENISVA ++++++++++++++
// 🔥 CONTADOR TERAPIA INTENSIVA (TIEMPO REAL)
const totalTerapiaIntensiva = mains.filter(
  (m) =>
    m.estado === 'Terapia Intensiva' //||
   // m.servicio === 'UCI' ||
    //m.servicio === 'UCI PEDIATRICA'
).length;
//+++++++++++++++++++++++++++++TERAPIA INTENISVA CONTADOR ++++++++++++++++++++


  //LOGICA DEL ESTADO PARA ALMACENAR EN FIREBASE SEGUN EL SELECTOR
  const handleEstadoChange = async (mainId, nuevoEstado) => {
    try {
      // 1️⃣ Actualiza UI
      setEstados((prev) => ({
        ...prev,
        [mainId]: nuevoEstado,
      }));

      // 2️⃣ Actualiza Firestore
      const ref = doc(db, 'admisiones', mainId);
      await updateDoc(ref, {
        'mainData.estado': nuevoEstado,
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
      // 1️⃣ UI inmediata
      setServicios((prev) => ({
        ...prev,
        [mainId]: nuevoServicio,
      }));

      // 2️⃣ Firebase
      const ref = doc(db, 'admisiones', mainId);
      await updateDoc(ref, {
        'mainData.servicio': nuevoServicio,
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

 // 🆕 Cargar últimos signos vitales desde Firebase para cada paciente (en tiempo real)
  useEffect(() => {
    if (!mains || mains.length === 0) {
      console.log('📊 No hay pacientes para cargar signos vitales');
      return;
    }

    const unsubscribers = [];

    mains.forEach((main) => {
      try {
        const vitalSignsRef = collection(db, 'admisiones', main.id, 'vital_signs');
        const q = query(vitalSignsRef, orderBy('createdAt', 'desc'), limit(1));

        // Usar onSnapshot para escuchar cambios en tiempo real
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const latestVital = snapshot.docs[0].data();
              console.log(`✅ Signos vitales cargados para ${main.nombre}:`, latestVital);
              
              // Actualizar el estado solo si hay datos
              setVitalSignsByPatient((prev) => ({
                ...prev,
                [main.id]: latestVital,
              }));
            } else {
              console.log(`📊 No hay signos vitales para ${main.nombre}`);
            }
          },
          (error) => {
            console.error(`❌ Error escuchando signos vitales para ${main.nombre}:`, error);
          }
        );

        unsubscribers.push(unsubscribe);
      } catch (error) {
        console.error(`❌ Error configurando listener para ${main.nombre}:`, error);
      }
    });

    // Limpiar los listeners cuando se desmonta o cambian los mains
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [mains]);


  // 🆕 Generar dinámicamente el resumen vitales desde Firebase
  const getDynamicResumenVitales = (mainId) => {
    const patientVitals = vitalSignsByPatient[mainId];
    
    if (patientVitals) {
      return [
        { label: 'P.A.', value: patientVitals.presion || '--' },
        { label: 'PULSO', value: `${patientVitals.pulso || '--'} lpm` },
        { label: 'TEMP.', value: `${patientVitals.temperatura || '--'} C` },
        { label: 'SAT O2', value: `${patientVitals.satO2 || '--'}%` },
        { label: 'PESO', value: `${patientVitals.peso || '--'} KG` },
        { label: 'F.R.', value: `${patientVitals.fr || '--'}/min` },
      ];
    }
    
    return resumenVitales; // Fallback a valores por defecto
  };

  const isNurseUser = role === ROLES.ENFERMERA;

  const getPatientMedicationRows = (mainId) => {
    const planItems = medicationPlanByPatient[mainId] || [];
    const recordsByKey = medicationRecordsByPatient[mainId] || {};
    const mergedItems = new Map(planItems.map((item) => [item.id, { ...item }]));

    Object.entries(recordsByKey).forEach(([key, record]) => {
      if (!mergedItems.has(key)) {
        mergedItems.set(key, {
          id: key,
          medicamento: record?.medicamento || 'Medicamento',
          horaPrimeraToma: record?.horaPrimeraToma || '--',
          proximaToma: record?.proximaToma || '--',
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

    try {
      const nurseName = profile?.nombre || user?.email || 'Enfermera de turno';
      const nowIso = new Date().toISOString();
      const scheduleHours = getMedicationScheduleHours(medicationItem, currentRecord);
      const nextAdministraciones = {
        ...(currentRecord?.administracionesPorHora || {}),
        [hour]: {
          confirmada: true,
          confirmationTime: nowIso,
          confirmadoPor: nurseName,
          nurseUid: user?.uid || null,
        },
      };

      const allConfirmed =
        scheduleHours.length > 0 &&
        scheduleHours.every((scheduledHour) =>
          Boolean(nextAdministraciones[scheduledHour]?.confirmada)
        );

      const medicationRef = doc(
        db,
        'admisiones',
        main.id,
        'medication_records',
        medicationItem.id
      );

      await setDoc(
        medicationRef,
        {
          medicationKey: medicationItem.id,
          medicamento: medicationItem.medicamento,
          horaPrimeraToma:
            medicationItem.horaPrimeraToma === '--'
              ? ''
              : medicationItem.horaPrimeraToma,
          proximaToma:
            medicationItem.proximaToma === '--' ? '' : medicationItem.proximaToma,
          source: medicationItem.source || 'Evolucion',
          horariosProgramados: scheduleHours,
          administracionesPorHora: nextAdministraciones,
          confirmada: allConfirmed,
          confirmationTime: allConfirmed ? nowIso : null,
          confirmadoPor: allConfirmed ? nurseName : '',
          nurseUid: allConfirmed ? user?.uid || null : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMedicationRecordsByPatient((prev) => ({
        ...prev,
        [main.id]: {
          ...(prev[main.id] || {}),
          [medicationItem.id]: {
            ...(prev[main.id]?.[medicationItem.id] || {}),
            medicationKey: medicationItem.id,
            medicamento: medicationItem.medicamento,
            horaPrimeraToma:
              medicationItem.horaPrimeraToma === '--'
                ? ''
                : medicationItem.horaPrimeraToma,
            proximaToma:
              medicationItem.proximaToma === '--' ? '' : medicationItem.proximaToma,
            source: medicationItem.source || 'Evolucion',
            horariosProgramados: scheduleHours,
            administracionesPorHora: nextAdministraciones,
            confirmada: allConfirmed,
            confirmationTime: allConfirmed ? nowIso : null,
            confirmadoPor: allConfirmed ? nurseName : '',
            nurseUid: allConfirmed ? user?.uid || null : null,
          },
        },
      }));

      toast({
        title: 'Registro de medicación',
        description: `La enfermera ${nurseName} registró ${medicationItem.medicamento} a las ${hour}.`,
      });
    } catch (error) {
      console.error('❌ Error registrando medicación desde dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la medicación.',
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
          <div className="max-w-9xl mx-auto flex justify-between items-center">
            <div className="text-[#69c9ba] font-bold text-3xl -translate-x-[-80px] text-center  w-full">
              RACK HOSPITALARIO
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[0.8rem] text-gray-700 font-medium flex items-right gap-1">
                <User className="w-8 h-8" />
                {profile?.nombre || user?.email || 'Usuario'}
                {role ? ` (${role})` : ''}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-[#69c9ba] bg-[#69c9ba] text-white hover:bg-[#76c4d5]"
              >
                <LogOut className=" w-4 h-4 mr-2" /> Salir
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
            <div className="flex gap-6">
              {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-44  p-5 rounded-3xl bg-gradient-to-br from-[#e6f6f6] to-white text-[#007e8f] shadow-lg border border-[#bde3e3]"
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
  className="relative w-44 p-5 rounded-3xl 
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
                className="relative w-44 p-5 rounded-3xl 
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
                className="relative w-44 p-5 rounded-3xl 
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
                onClick={() => navigate('/Parte-Operatorio')}
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
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}
        {/* ++++++++++++++++++++++++++++++++++++aqui empieza el header gpt 5 ++++++++++++++++++++++++++++++++++++++++++ */}

        <div className="max-w-9xl mx-auto p-2 pb-72">
          <Card className="border border-[#007e8f]/30 overflow-visible">
            <table className="w-full text-sm relative">
              <thead className="bg-[#76c4d5] text-white uppercase text-xs tracking-wider">
                {/*turqueza encabezado */}
                <tr>
                  <th
                    className="text-center px-4 py-3 cursor-pointer select-none"
                    onClick={() => setOrderAsc(!orderAsc)}
                  >
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Fecha de Ingreso{' '}
                    <ArrowBigUp className="inline w-4 h-4 mr-2" />
                  </th>
                  <th className="text-left px-4 py-3">Estancia</th>
                  <th className="text-center px-4 py-3">Paciente</th>
                  <th className="text-center px-4 py-3">HCL</th>
                  <th className="text-center px-4 py-3">Médico</th>
                  <th className="text-center px-4 py-3">Alertas</th>
                  <th className="text-center px-4 py-3">Estado</th>

                  <th className="text-center px-4 py-3">Servicio</th>
                  <th className="text-center px-4 py-3">Seguro</th>
                  <th className="text-center px-4 py-3">Módulos</th>
                </tr>
              </thead>

              {/*Elgrupo para leer datos de las citas*/}
              <tbody>
                {sortedMains.map((main, index) => {
                  const patientMedicationRows = getPatientMedicationRows(main.id);
                  const pendingMedicationCount = getPendingMedicationCount(main.id);

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
                    <td className="px-4 py-3 text-center text-[#000d5b] bg-[#f1f5f9] ">
                      {main.fechaIngreso}
                    </td>

                    {/**Aqui PARA QUE ME DE LA ESTADIA DEL PACIENTE TENGO QUE SUMAR LOS DIAS DESDE QUE INGRESO */}
                    <td className="px-4 py-3 text-center text-[#000d5b]  ">
                      {main.estancia} <h1>días</h1>
                    </td>

                    {/*Elgrupo de las personas que estan en mi dashboard traidas directamente de firebase*/}
                    <td className="relative px-4 py-3 bg-[#f1f5f9] text-center">
                      <div className="inline-block group cursor-pointer">
                        {/* Nombre */}
                        <span className="text-gray-900 font-medium group-hover:text-[#007e8f] transition">
                          {main.nombre}
                        </span>

                        {/* Tooltip */}
                        <div
                          className="pointer-events-none absolute top-full left-1/2 z-[100] w-80 -translate-x-1/2 mt-2
        scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 rounded-lg bg-white border border-gray-200
        shadow-2xl p-4 text-xs text-gray-800"
                        >
                          <p className="font-semibold text-[#007e8f] mb-3 flex items-center gap-1">
                            🩺 Signos vitales
                          </p>

                        
                           <div className="bg-gradient-to-br from-[#4EA685]/20 to-[#76C4D5]/30 rounded-lg p-3 text-sm text-gray-700">
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
                    <td className="px-4 py-3 text-[#000d5b] font-semibold ">
                      {main.cedula}
                    </td>
                    {/* MEDICO */}
                    <td className="px-4 py-3 text-gray-700 bg-[#f1f5f9]">
                      {main.medico}
                    </td>
                    {/* *******************************AQUI AGRUPO TRES TIPOS DE ALERGIAS QUE *******************************
                     *******************************TRAIGO DESDE FIREBASE PARA NO *******************************
                     *******************************TENER QUE CONECTAR CON LA APLICACION MISMA *******************************
                     *******************************MUCHO OJO SE AGRUPA DESDE AQUI HASTA ******************************* */}

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
                          <p className="font-semibold text-[#007e8f] mb-2 flex items-center gap-1">
                            INDICACION NUEVA: PARACETAMOL
                            <p>6:00 AM</p> <br />
                            <p>18:00 PM</p>
                          </p>

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
                          <div className="absolute bottom-full left-1/2 z-50 w-72 -translate-x-1/2 -translate-y-1 rounded-xl bg-white border border-gray-300 shadow-xl p-3 text-xs text-gray-800">
                            <p className="font-semibold text-[#007e8f] mb-2">
                              HORARIO DE MEDICAMENTOS
                            </p>

                            {patientMedicationRows.length === 0 ? (
                              <p className="text-gray-600">
                                Sin medicación pendiente para este paciente.
                              </p>
                            ) : (
                              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                {patientMedicationRows.map((medication) => (
                                  <div
                                    key={medication.id}
                                    className="rounded-lg border border-gray-200 bg-slate-50 px-2 py-2"
                                  >
                                    <p className="font-semibold text-[#1c3f6e]">
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
                                              className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                                                isCompleted
                                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                  : 'bg-red-100 text-red-700 border border-red-300'
                                              } ${
                                                !isNurseUser
                                                  ? 'cursor-not-allowed opacity-90'
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

                            <p className="mt-2 text-[11px] font-semibold text-slate-600">
                              Pendientes: {pendingMedicationCount}
                            </p>

                            {!isNurseUser ? (
                              <p className="mt-1 text-[10px] text-amber-700">
                                Solo usuarios de enfermería pueden registrar la medicación.
                              </p>
                            ) : null}

                            {/* Flechita */}
                            <div className="absolute left-6 top-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* ARRIBA AQUI AGRUPO TRES TIPOS DE ALERGIAS QUE TRAIGO DESDE FIREBASE PARA NO *******************************
                     ******************************* TENER QUE CONECTAR CON LA APLICACION MISMA *******************************
                     *******************************MUCHO OJO SE AGRUPA DESDE AQUI HASTA ******************************* */}

                    {/**AQUI AGREGO EL SELECTOR DE ESTADOS DEPENDE DE QUE SE ENCUENTRE EL PACIENTE */}
                    <td className="px-4 py-3 text-center font-medium bg-[#f1f5f9]">
                      <div className="flex items-center justify-center gap-2">
                        {/* Punto de color */}
                        <span
                          className={`w-3 h-3 rounded-full ${
                            estadosPaciente[estados[main.id] || 'Atención']
                              .color
                          }`}
                        />

                        {/* Selector */}
                        <select
                          value={estados[main.id] || 'Atención'}
                          onChange={(e) =>
                            handleEstadoChange(main.id, e.target.value)
                          }
                          className="px-2 py-1 rounded-full text-xs font-semibold bg-[#0b4f6c]/10 text-blue-700 hover:text-[#007e8f] transition"
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
                          value={servicios[main.id] || ''}
                          onChange={(e) =>
                            handleServicioChange(main.id, e.target.value)
                          }
                          className="bg-transparent border-none outline-none font-semibold text-[#007e8f] hover:text-[#007e8f] transition"
                        >
                          {serviciosHospital.map((servicio) => (
                            <option key={servicio} value={servicio}>
                              {servicio}
                            </option>
                          ))}
                        </select>

                        {/* 🔥 INFORMACIÓN DE UBICACIÓN (NUEVA ESTRUCTURA) */}
                        {main.ubicacion && (
                          <div className="text-[11px] text-gray-500 mt-1 leading-tight">
                            {/* Piso si existe */}
                            {main.ubicacion.piso && (
                              <div>Piso {main.ubicacion.piso}</div>
                            )}

                            {/* Habitación si existe */}
                            {main.ubicacion.habitacion && (
                              <div>{main.ubicacion.habitacion}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    {/**AGREGAR SELECTOR PARA SERVICIOS ****++++++++++++++++++++++++++++++++++*******a */}

                    <td className="px-4 py-3 text-[#000d5b] bg-[#f1f5f9]">
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
          <span className="px-3 py-1 rounded bg-[#007e8f] text-white hover:bg-[#16324a] font-bold cursor-pointer">
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
