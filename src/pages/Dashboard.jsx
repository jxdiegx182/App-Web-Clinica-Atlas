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
  updateDoc,
} from 'firebase/firestore';
import GraficoPastelServicio from '../components/GraficoPastelServicio'; // el raficoPastelServicio se trae a esta pagina DASHBOARD
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

const estadosPaciente = {
  Espera: { color: 'bg-gray-400', text: 'text-gray-700' },
  Atención: { color: 'bg-green-500', text: 'text-blue-700' },
  'Terapia Intensiva': { color: 'bg-orange-400', text: 'text-red-700' },
  'Alta Médica': { color: 'bg-green-500', text: 'text-green-700' },
  Procedimiento: { color: 'bg-yellow-500', text: 'text-yellow-700' },
  Quirófano: { color: 'bg-red-500', text: 'text-purple-700' },
};
//constantes para agregar en el servicio del dashboard
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

const Dashboard = () => {
  const { user, profile, role, logout } = useAuth(); //USUARIO
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(''); //BUSQUEDA DE TERMINOS
  const [estados, setEstados] = useState({});
  const [mains, setMains] = useState([]);
  const [alertasEnfermeria, setAlertasEnfermeria] = useState({}); // Alertas activas por paciente
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date()); //* aqui es la fecha comun*/

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

  //aqui agreg el usefect para las alerta en module enfermeria
  useEffect(() => {
    const alertasIniciales = {};
    mains.forEach((m) => {
      if (m.horarioDos) {
        alertasIniciales[m.id] = true; // 🔴 alerta activa
      }
    });
    setAlertasEnfermeria(alertasIniciales);
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

  const getStatusColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'En Atención':
        return 'bg-purple-100 text-black';
      case 'alta':
        return 'bg-gray-300 text-black';
      case 'serv rx':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  //BUSQUEDA
  const filteredMains = mains.filter(
    (main) =>
      main.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || //busqueda
      main.cedula.includes(searchTerm) ||
      main.medico.toLowerCase().includes(searchTerm.toLowerCase())
  );
  //*******************************AQUI PARA LO DINAMICO DEL HORARIO PILAS   */
  //constante para que se mantenga el toltip mostrado en cierto tiempo
  const [showTooltip, setShowTooltip] = useState(false);
  let hideTimeout;
  //constantes de Cambiar horarioDos de rojo a verde al hacer clic
  const [horarioRegistrado, setHorarioRegistrado] = useState(false);
  //AQUI OTRA CONSTANTE DE MEDICAMENTO REGISTRADO POR UNOS SEGUNDOS
  const [showMensaje, setShowMensaje] = useState(false);

  //************************************************** */

  //ORDEN ASCENDENTE O DESCENDENTE
  const [orderAsc, setOrderAsc] = useState(true);
  //agreo las constantes de servicios
  const [servicios, setServicios] = useState({});

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
            <div className="text-[#008C8C] font-bold text-3xl -translate-x-[-80px] text-center  w-full">
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
                className="border-[#007e8f] bg-[#007e8f] text-white hover:bg-[#007e8f]"
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
                className="text-white h-10 px-5 rounded-xl bg-[#007e8f] hover:bg-[#16324a] shadow-md"
                onClick={() => navigate('/Parte-Operatorio')}
              >
                <Activity className="text-white w-4 h-4 mr-2" />
                Parte Operatorio
              </Button>

              <Button
                className=" text-white h-10 px-5 rounded-xl bg-[#007e8f] hover:bg-[#16324a] shadow-md"
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

        <div className="max-w-9xl mx-auto p-2">
          <Card className="border border-[#007e8f]/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#007e8f] text-white uppercase text-xs tracking-wider">
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
                {sortedMains.map((main, index) => (
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
                          className="
        pointer-events-none
        absolute bottom-full left-1/2 z-50
        w-64 -translate-x-[-80px] -translate-y-[-60px] 
        scale-95 opacity-0
        group-hover:scale-100 group-hover:opacity-90
        transition-all duration-200
        rounded-xl bg-white border border-gray-300
        shadow-xl p-3 text-xs text-gray-800
      "
                        >
                          <p className="font-semibold text-[#007e8f] mb-2 flex items-center gap-1">
                            🩺 Signos vitales
                          </p>

                          <ul className="space-y-1/2">
                            <li> Presión Arterial: --</li>
                            <li>🌡️ Temperatura: --</li>
                            <li>🩺 Frecuencia Respiratoria: --</li>
                          </ul>

                          {/* Flechita */}
                          <div
                            className="
          absolute left-1 top-full
          -translate-x-4 -translate-y-10
          w-3 h-3 bg-white
          border-r border-b border-gray-300
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
                        onMouseLeave={() =>
                          setTimeout(() => setShowTooltip(null), 2900)
                        }
                      >
                        <span className="text-gray-900 font-medium hover:text-[#007e8f] transition">
                          {main.alergiaIconTres}
                        </span>

                        {showTooltip === main.id && (
                          <div className="absolute bottom-full left-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1 rounded-xl bg-white border border-gray-300 shadow-xl p-3 text-xs text-gray-800">
                            <p className="font-semibold text-[#007e8f] mb-2">
                              HORARIO DE MEDICAMENTOS
                            </p>

                            <p>
                              PARACETAMOL:
                              <span
                                onClick={() => {
                                  setHorarioRegistrado((prev) => ({
                                    ...prev,
                                    [main.id]: true,
                                  }));

                                  setAlertasEnfermeria((prev) => ({
                                    ...prev,
                                    [main.id]: false,
                                  }));

                                  setShowMensaje(main.id);
                                  setTimeout(() => setShowMensaje(null), 2000);
                                }}
                                className={`ml-2 cursor-pointer font-semibold 
                                ${
                                  horarioRegistrado?.[main.id]
                                    ? 'text-green-600'
                                    : 'text-[#F4320B]'
                                }`}
                              >
                                {main.horarioDos}
                              </span>
                            </p>

                            <p>
                              KETOROLACO:
                              <span
                                onClick={() => {
                                  setHorarioRegistrado((prev) => ({
                                    ...prev,
                                    [main.id]: true,
                                  }));

                                  setAlertasEnfermeria((prev) => ({
                                    ...prev,
                                    [main.id]: false,
                                  }));

                                  setShowMensaje(main.id);
                                  setTimeout(() => setShowMensaje(null), 2000);
                                }}
                                className={`ml-2 cursor-pointer font-semibold 
                                ${
                                  horarioRegistrado?.[main.id]
                                    ? 'text-green-600'
                                    : 'text-[#F4320B]'
                                }`}
                              >
                                {main.horarioTres}
                              </span>
                            </p>

                            {/* Flechita */}
                            <div className="absolute left-6 top-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45" />
                          </div>
                        )}

                        {showMensaje === main.id && (
                          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in -translate-x-[500px] -translate-y-[-130px]">
                            ✅ Medicamento registrado por la Enfermera: ______
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
                                alertasEnfermeria[main.id] && (
                                  <span
                                    className="absolute -top-1 -right-1 bg-red-600 text-white 
      text-[10px] w-5 h-5 rounded-full flex items-center justify-center
      alert-pulse"
                                  >
                                    1
                                  </span>
                                )}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
