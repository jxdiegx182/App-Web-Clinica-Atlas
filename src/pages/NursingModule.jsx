import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const historialIngresos = [
  { date: '03/03/2026', note: 'Actual - Emergencia', active: true },
  { date: '21/12/2023' },
  { date: '15/10/2019' },
  { date: '15/12/2015' },
  { date: '10/08/2013' },
  { date: '22/04/2011' },
  { date: '05/08/2024' },
  { date: '05/07/2009' },
  { date: '05/01/2024' },
  { date: '05/02/2024' },
];

const resumenVitales = [
  { label: 'P.A.', value: '148/95', alert: true },
  { label: 'PULSO', value: '88 lpm' },
  { label: 'TEMP.', value: '37.8 C' },
  { label: 'SAT O2', value: '94%', alert: true },
  { label: 'PESO', value: '78 KG' },
  { label: 'F.R.', value: '22/min' },
];

const moduloEnfermeriaSecciones = [
  {
    title: 'URGENTE - CON ALERTAS ACTIVAS DEL MODULO MEDICO',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      {
        key: 'signos_vitales',
        title: 'Signos Vitales',
        description: 'PA 148/95 - SAT 94% - Temp 37.8 C',
        status: 'Ultimo registro: 12:00',
        icon: '📊',
        badge: 'Alerta',
        badgeClass: 'bg-red-100 text-red-700',
        tone: 'danger',
      },
      {
        key: 'registro_med',
        title: 'Registro Medicacion',
        description: 'Administracion y descargo de farmacos',
        status: '11:00 pendiente',
        icon: '💊',
        badge: '1 atrasada',
        badgeClass: 'bg-red-100 text-red-700',
        tone: 'danger',
      },
      {
        key: 'descargo_med',
        title: 'Descargo Medicacion',
        description: 'Consumo y egreso de stock farmacologico',
        status: '3 items',
        icon: '📦',
        badge: 'Pendiente',
        badgeClass: 'bg-amber-100 text-amber-700',
        tone: 'warning',
      },
      {
        key: 'enviar_alerta',
        title: 'Enviar Alerta al Medico',
        description: 'Comunicacion directa con medico tratante',
        status: 'Dr. Varela en linea',
        icon: '📤',
        badge: 'Al Medico',
        badgeClass: 'bg-indigo-100 text-indigo-700',
        tone: 'primary',
      },
    ],
  },
  {
    title: 'CUIDADO DIRECTO DEL PACIENTE',
    gridClass: 'md:grid-cols-2 xl:grid-cols-3',
    modules: [
      {
        key: 'ingesta_eliminacion',
        title: 'Ingesta y Eliminacion',
        description: 'Control de balance hidrico y diuresis',
        status: 'Hoy: 1.8L / 2.0L',
        icon: '💧',
        badge: 'Balance: -200ml',
        badgeClass: 'bg-teal-100 text-teal-700',
        tone: 'teal',
      },
      {
        key: 'hidratacion',
        title: 'Hidratacion IV',
        description: 'Monitoreo y control de infusiones',
        status: '500mL x 42 gts/min',
        icon: '🧪',
        tone: 'info',
      },
      {
        key: 'registro_oxigeno',
        title: 'Registro Oxigeno',
        description: 'Oxigenoterapia, sat y dispositivos',
        status: 'Canula 2 L/min',
        icon: '🫁',
        badge: 'SAT 94%',
        badgeClass: 'bg-amber-100 text-amber-700',
        tone: 'warning',
      },
      {
        key: 'informe_enf',
        title: 'Informe Enfermeria',
        description: 'Notas de turno y evolucion enfermeria',
        status: 'Ultimo: 08:00',
        icon: '📝',
        tone: 'pink',
      },
      {
        key: 'dietas',
        title: 'Solicitud de Dietas',
        description: 'Regimen alimenticio y restricciones',
        status: 'Dieta blanda activa',
        icon: '🍽️',
        tone: 'success',
      },
      {
        key: 'screen_rn',
        title: 'Screen RN',
        description: 'Monitoreo continuo de parametros',
        status: 'Ver monitoreo',
        icon: '🖥️',
        tone: 'info',
      },
    ],
  },
  {
    title: 'AREA QUIRURGICA Y RECUPERACION',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      {
        key: 'preq_enf',
        title: 'Pre-Quirurgico Enfermeria',
        description: 'Preparacion del paciente para cirugia',
        status: 'Pendiente',
        icon: '✅',
        tone: 'danger',
      },
      {
        key: 'informe_rec',
        title: 'Informe de Recuperacion',
        description: 'Registro de UCI post-operatoria',
        status: 'Sin registro',
        icon: '🛌',
        tone: 'neutral',
      },
      {
        key: 'parte_op',
        title: 'Parte Operatorio',
        description: 'Reporte de sala de operaciones',
        status: 'Ver parte',
        icon: '📋',
        route: '/Parte-Operatorio',
        tone: 'primary',
      },
      {
        key: 'guia_enf',
        title: 'Guia de Enfermeria',
        description: 'Protocolos y referencias',
        status: 'Ver protocolos',
        icon: '📚',
        tone: 'success',
      },
    ],
  },
  {
    title: 'ADMINISTRATIVO',
    gridClass: 'md:grid-cols-2',
    modules: [
      {
        key: 'cargo_cuenta',
        title: 'Cargo a Cuenta',
        description: 'Registro de consumos para facturacion',
        status: '3 items pendientes',
        icon: '💳',
        badge: 'Activo',
        badgeClass: 'bg-teal-100 text-teal-700',
        tone: 'teal',
      },
      {
        key: 'alertas_centro',
        title: 'Centro de Alertas Medico - Enfermeria',
        description: 'Panel de comunicacion bidireccional',
        status: '3 alertas activas',
        icon: '🔗',
        badge: 'Interconectado',
        badgeClass: 'bg-sky-100 text-sky-700',
        tone: 'info',
      },
    ],
  },
];

const cardToneClasses = {
  danger: 'border-red-200 hover:border-red-400',
  warning: 'border-amber-200 hover:border-amber-400',
  primary: 'border-indigo-200 hover:border-indigo-400',
  success: 'border-emerald-200 hover:border-emerald-400',
  info: 'border-sky-200 hover:border-sky-400',
  teal: 'border-teal-200 hover:border-teal-400',
  pink: 'border-pink-200 hover:border-pink-400',
  neutral: 'border-slate-200 hover:border-slate-400',
};

    const NurseModulePanel = () => {
      const { mainId } = useParams();
      const [time, setTime] = useState(new Date());
      const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
      const [loading, setLoading] = useState(true);
      const [historialActivo, setHistorialActivo] = useState(0);
      const [moduloActivo, setModuloActivo] = useState('');
      const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

//Aqui traigo de firebase para el encabezado
useEffect(() => {
  const fetchAdmisiones = async () => {
    console.log('🧪 mainId recibido:', mainId);

    if (!mainId) {
      console.warn('⚠️ mainId es undefined o null'); 
      setLoading(false);
      return;
    }
    try {
      const ref = doc(db, 'admisiones', mainId);
      const snap = await getDoc(ref);
         if (!snap.exists()) {
        console.warn('❌ Documento no existe');
        setAdmisiones(null);
        return;
      }
      const data = snap.data();
         setAdmisiones({
            id: snap.id,
            ...data,
            ...data.mainData,
          });
        } catch (error) {
      console.error('❌ Error al obtener admisiones:', error);
      setAdmisiones(null);
    } finally {
      setLoading(false);
    }
  };
  fetchAdmisiones();
}, [mainId]);
//hasta aqui traigo de firebase

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  const openNursingModule = (module) => {
    setModuloActivo(module.title);

    if (module.route) {
      navigate(module.route);
      return;
    }

    toast({
      title: module.title,
      description: 'Vista estetica lista. Pendiente formulario y conexion con Firebase.',
    });
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      
      <div className="relative mb-2">
        <button
           onClick={() => window.history.back()}
           className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
          > 
          ← Volver
        </button>
      <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">MODULO ENFERMERIA</h1>
        </div>
      
      <div className="min-h-screen bg-[#4b6bb3]/20 p-2">
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur">
          
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs leading-tight">
        <div className="rounded-xl bg-[#007e8f]/5 p-2">
            {/*la imagen de la clinica atlas y su fecha */}
               <img
                  src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                  alt="Logo Clinica Atlas"
                  className="w-36 h-auto"
              />
              <p className="mt-1 text-sm font-bold text-[#1c3f6e]">{formattedTime}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#007e8f]">
                {formattedDate.toUpperCase()}
              </p>
          </div>
          
         
         

{/* 🔄 Mostrar datos del citas o cargando */}
{loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p className="font-bold text-sm text-[#1c3f6e]">{admisiones.firstName} {admisiones.lastName}{' '}</p>
                  <p><strong>Identificacion:</strong> {admisiones.cedula}</p>
                  <p><strong>Edad:</strong> {admisiones.seguro}</p>
                  <p><strong>Medico:</strong> {admisiones.medico}</p>
                  <p><strong>Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}</p>
                  <p><strong>Estancia:</strong> {admisiones.dias}</p>
                  
                </div>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                <p><strong>Servicio:</strong> {admisiones.servicio}</p>
                  <p><strong>Seguro:</strong> {admisiones.seguro}</p>
                  <p><strong>Alergias:</strong> {admisiones.secondaryData?.numero || 'No registrado'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#ffffff] to-[#f3f8fc] border border-[#007e8f]/15 p-2 text-center font-semibold text-[#1c3f6e]">
                  <p>PISO 2</p>
                  <p>HAB 201</p>
                  <p className="mt-1 text-[10px] font-bold text-[#007e8f]">Turno Enfermeria</p>
                </div>
                  
                
                
              </>
            ) : (
              <p className="text-red-600 font-bold">
                ❌ No se encontró información de admisiones.estoy arto
              </p>
            )}

            {/*HASTA AQUI DE FIREBASE */}


        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white rounded-lg p-0 col-span-1 text-sm shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-white to-indigo-50/70">
            <h2 className="font-semibold text-gray-800">HISTORIAL DE INGRESOS</h2>
          </div>

          <div className="overflow-y-auto max-h-[290px] pr-1">
            <div className="p-2 space-y-1">
              {historialIngresos.map((item, index) => (
                <button
                  key={`${item.date}-${index}`}
                  onClick={() => setHistorialActivo(index)}
                  className={`w-full text-left rounded-lg px-3 py-2 transition border ${
                    historialActivo === index
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-slate-700">{item.date}</p>
                  {item.note ? <p className="text-xs text-indigo-700">{item.note}</p> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="m-3 bg-[#d3efe9] rounded-lg p-4 text-sm text-gray-700">
            <h3 className="font-semibold text-slate-700 mb-2">SIGNOS VITALES</h3>
            <div className="grid grid-cols-2 gap-2">
              {resumenVitales.map((vital) => (
                <div
                  key={vital.label}
                  className={`rounded-md px-2 py-1.5 ${
                    vital.alert ? 'bg-red-100 text-red-700' : 'bg-white text-slate-700'
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase">{vital.label}</p>
                  <p className="text-xs font-bold">{vital.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full col-span-3 md:col-span-3 bg-white rounded-lg p-5 shadow mx-auto max-w-6xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h2 className="text-xl font-bold bg-[#162f5c] text-white inline-block px-4 py-2 rounded-full w-fit">
                MODULO ENFERMERIA
              </h2>
              <Badge className="w-fit bg-[#4b6bb3] text-white hover:bg-[#4b6bb3]">
                {moduloActivo ? `Modulo activo: ${moduloActivo}` : 'Selecciona un modulo'}
              </Badge>
            </div>

            {moduloEnfermeriaSecciones.map((section) => (
              <section key={section.title}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                    {section.title}
                  </h3>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                <div className={`grid grid-cols-1 ${section.gridClass} gap-3`}>
                  {section.modules.map((module) => (
                    <button
                      type="button"
                      key={module.key}
                      onClick={() => openNursingModule(module)}
                      className={`rounded-xl border p-3 text-left transition hover:shadow-md bg-white ${
                        cardToneClasses[module.tone] || cardToneClasses.primary
                      } ${
                        moduloActivo === module.title
                          ? 'ring-2 ring-[#4b6bb3] ring-offset-1'
                          : 'ring-0'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-2xl">{module.icon}</div>
                        {module.badge ? (
                          <Badge className={module.badgeClass}>
                            {module.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-800">{module.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{module.description}</p>
                      <p className="text-[11px] font-semibold text-[#1c396b] mt-2">{module.status}</p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
    </div>
  );
};

export default NurseModulePanel;
