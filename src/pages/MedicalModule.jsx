import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import Anamnesis from './Anamnesis';
import { Stethoscope, Building, } from 'lucide-react';
import Emergencia from './Emergencia';
import Epicrisis from './Epicrisis';
import Evolucion from './Evolucion';
import Interconsulta from './Interconsulta';
import Certificado from './Certificado';
import Receta from './Receta';
import Protocolo from './Protocolo';
import RegAnestesia from './RegAnestesia';
import MedicalModuleConsen from './Consentimientos';

const historialIngresos = [
  { date: '03/03/2026', note: 'Actual - Hospitalizacion', active: true },
  { date: '05/07/2024' },
  { date: '05/02/2024' },
  { date: '05/01/2024' },
  { date: '21/12/2023' },
  { date: '05/08/2023' },
  { date: '15/10/2019' },
  { date: '15/12/2015' },
  { date: '10/08/2013' },
  { date: '22/04/2011' },
];

const resumenVitales = [
  { label: 'P.A.', value: '--' },
  { label: 'PULSO', value: '-- lpm' },
  { label: 'TEMP.', value: '-- C' },
  { label: 'SAT O2', value: '--%' },
  { label: 'PESO', value: '-- KG' },
  { label: 'F.R.', value: '--/min' },
];

const moduloMedicoSecciones = [
  {
    title: 'URGENTES - REQUIEREN ATENCION',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      {
        key: 'emergencias',
        title: 'Emergencias',
        description: 'Protocolo de emergencias medicas',
        status: 'Activar protocolo',
        icon: '🚨',
        badge: 'URGENTE',
        badgeClass: 'bg-red-100 text-red-700',
        tone: 'danger',
        modalKey: 'emergencias',
      },
      {
        key: 'anamnesis',
        title: 'Anamnesis',
        description: 'Historia clinica y antecedentes',
        status: 'Sin completar',
        icon: '📝',
        badge: 'Pendiente',
        badgeClass: 'bg-red-100 text-red-700',
        tone: 'danger',
        modalKey: 'anamnesis',
      },
      {
        key: 'evolucion',
        title: 'Evolucion y Prescripcion',
        description: 'Registro diario y ordenes medicas',
        status: 'Ultima: ayer',
        icon: '📈',
        badge: 'Diario',
        badgeClass: 'bg-amber-100 text-amber-700',
        tone: 'warning',
        modalKey: 'evolucion',
      },
      {
        key: 'consentimientos',
        title: 'Consentimientos Informados',
        description: 'Firma y registro de consentimientos',
        status: '1 pendiente',
        icon: '✍️',
        badge: 'Requiere firma',
        badgeClass: 'bg-yellow-100 text-yellow-700',
        tone: 'warning',
        modalKey: 'consentimientos',
      },
    ],
  },
  {
    title: 'EVALUACION CLINICA',
    gridClass: 'md:grid-cols-2 xl:grid-cols-3',
    modules: [
      {
        key: 'examen_fisico',
        title: 'Examen Fisico RN',
        description: 'Evaluacion fisica por sistemas',
        status: 'Ver ultimo registro',
        icon: '🔬',
        tone: 'info',
        modalKey: 'examen_fisico',
      },
      {
        key: 'interconsulta',
        title: 'Interconsulta',
        description: 'Solicitud a otras especialidades',
        status: '2 abiertas',
        icon: '👥',
        badge: 'En proceso',
        badgeClass: 'bg-blue-100 text-blue-700',
        tone: 'primary',
        modalKey: 'interconsulta',
      },
      {
        key: 'pedido_examenes',
        title: 'Pedido de Examenes',
        description: 'Laboratorio e imagenes diagnosticas',
        status: '3 pendientes',
        icon: '🧪',
        badge: 'Pend.',
        badgeClass: 'bg-violet-100 text-violet-700',
        tone: 'teal',
        modalKey: 'pedido_examenes',
      },
      {
        key: 'receta',
        title: 'Receta Medica',
        description: 'Prescripcion DCI MSP 0031-2020',
        status: 'Ultima: 01/03',
        icon: '💊',
        tone: 'success',
        modalKey: 'receta',
      },
      {
        key: 'certificado',
        title: 'Certificado Medico',
        description: 'Certificado unico de salud MSP',
        status: 'Generar nuevo',
        icon: '📄',
        tone: 'primary',
        modalKey: 'certificado',
      },
      {
        key: 'epicrisis',
        title: 'Epicrisis',
        description: 'Resumen de alta hospitalaria',
        status: 'Alta programada',
        icon: '📋',
        badge: 'Alta hoy',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        tone: 'success',
        modalKey: 'epicrisis',
      },
    ],
  },
  {
    title: 'MODULO QUIRURGICO',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      {
        key: 'preq',
        title: 'Chequeo Prequirurgico',
        description: 'Checklist de seguridad quirurgica',
        status: 'Pendiente',
        icon: '✅',
        tone: 'danger',
        modalKey: 'preq',
      },
      {
        key: 'anestesia',
        title: 'Registro de Anestesia',
        description: 'Hoja anestesica intraoperatoria',
        status: 'Ver registro',
        icon: '💉',
        tone: 'neutral',
        modalKey: 'anestesia',
      },
      {
        key: 'protocolo',
        title: 'Protocolo Operatorio',
        description: 'Informe y tecnica quirurgica',
        status: 'Sin registro',
        icon: '⚕️',
        tone: 'neutral',
        modalKey: 'protocolo',
      },
      {
        key: 'revit',
        title: 'REVIT',
        description: 'Visualizacion intraoperatoria 3D',
        status: 'Ver planos',
        icon: '🏗️',
        tone: 'info',
        modalKey: 'revit',
      },
    ],
  },
  {
    title: 'HERRAMIENTAS CON IA',
    gridClass: 'md:grid-cols-2',
    modules: [
      {
        key: 'chatbot',
        title: 'ChatBot Medico IA',
        description: 'Soporte a decisiones clinicas en tiempo real',
        status: 'En linea',
        icon: '🤖',
        badge: 'IA BETA',
        badgeClass: 'bg-violet-100 text-violet-700',
        tone: 'pink',
        modalKey: 'chatbot',
      },
      {
        key: 'auditoria',
        title: 'Auditoria Clinica con IA',
        description: 'Validacion CIE-10 y hallazgos automaticos',
        status: '3 alertas detectadas',
        icon: '🔍',
        badge: 'Score 84',
        badgeClass: 'bg-blue-100 text-blue-700',
        tone: 'primary',
        modalKey: 'auditoria',
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

const inputClass =
  'mt-1 w-full rounded-lg border border-[#007e8f]/30 bg-white px-3 py-2 text-sm text-[#1c3f6e] outline-none focus:border-[#007e8f]';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h4 className="border-b border-[#007e8f]/20 pb-1 text-xs font-bold uppercase tracking-wide text-[#1c3f6e]">
      {title}
    </h4>
    {children}
  </div>
);

const Field = ({ label, textarea = false }) => (
  <label className="block text-xs font-semibold text-[#1c3f6e]">
    {label}
    {textarea ? (
      <textarea className={`${inputClass} min-h-[90px]`} />
    ) : (
      <input className={inputClass} />
    )}
  </label>
);

const modalRegistry = {
  emergencias: {
    title: 'EMERGENCIAS',
    showSave: false,
    pageComponent: Emergencia,
  },

  anamnesis: {
    title: 'ANAMNESIS',
    showSave: false,
    pageComponent: Anamnesis,
  },

  evolucion: { title: 'EVOLUCION DIARIA Y PRESCRIPCION', showSave: false, pageComponent: Evolucion },
  interconsulta: { title: 'INTERCONSULTA', showSave: false, pageComponent: Interconsulta },
  epicrisis: {
    title: 'EPICRISIS',
    showSave: false,
    pageComponent: Epicrisis,
  },
  certificado: { title: 'CERTIFICADO MEDICO', showSave: false, pageComponent: Certificado },
  preq: { title: 'CHEQUEO PREQUIRURGICO', showSave: true, render: () => <Field label="Checklist prequirurgico" textarea /> },
  anestesia: { title: 'REGISTRO ANESTESIA', showSave: false, pageComponent: RegAnestesia },
  protocolo: { title: 'PROTOCOLO OPERATORIO', showSave: false, pageComponent: Protocolo },
  receta: { title: 'RECETA', showSave: false, pageComponent: Receta },
  consentimientos: { title: 'CONSENTIMIENTOS INFORMADOS', showSave: false, pageComponent: MedicalModuleConsen },
  pedido_examenes: { title: 'PEDIDO EXAMENES', showSave: true, render: () => <Field label="Pedido de examenes" textarea /> },
  revit: { title: 'REVIT', showSave: false, render: () => <p className="text-sm text-[#1c3f6e]">Visualizacion 3D del modulo quirurgico.</p> },
  examen_fisico: { title: 'EXAMEN FISICO RN', showSave: true, render: () => <Field label="Examen fisico por sistemas" textarea /> },
  chatbot: { title: 'CHATBOT', showSave: false, render: () => <Field label="Consulta al asistente clinico IA" textarea /> },
  auditoria: {
    title: 'AUDITORIA CLINICA CON IA',
    showSave: true,
    render: () => (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-2xl font-black text-emerald-600">84</p>
            <p className="text-[10px] font-bold uppercase text-emerald-700">Score general</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-2xl font-black text-amber-600">3</p>
            <p className="text-[10px] font-bold uppercase text-amber-700">Alertas</p>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-center">
            <p className="text-2xl font-black text-sky-600">7</p>
            <p className="text-[10px] font-bold uppercase text-sky-700">Dias auditados</p>
          </div>
        </div>
        <Field label="Hallazgos de IA" textarea />
      </div>
    ),
  },
};

const MedicalModulePanel = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [admisiones, setAdmisiones] = useState(null);
  const [edad, setEdad] = useState(0);
  const [estancia, setEstancia] = useState(0);
  const [historialActivo, setHistorialActivo] = useState(0);
  const [moduloActivo, setModuloActivo] = useState('');
  const [activeModalKey, setActiveModalKey] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);
  const [latestIngresos, setLatestIngresos] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAdmisiones = async () => {
      if (!mainId) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, 'admisiones', mainId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setAdmisiones(null);
          return;
        }
        const data = snap.data();
        setAdmisiones({ id: snap.id, ...data, ...data.mainData });
      } catch (error) {
        console.error('Error al obtener admisiones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmisiones();
  }, [mainId]);

  // 🆕 Cargar últimos signos vitales desde Firebase
  useEffect(() => {
    const loadLatestVitalSigns = async () => {
      if (!mainId) return;

      try {
        const vitalSignsRef = collection(db, 'admisiones', mainId, 'vital_signs');
        const q = query(vitalSignsRef, orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log('📊 Módulo Médico: No hay signos vitales guardados');
          return;
        }

        const latestVital = snapshot.docs[0].data();
        console.log('✅ Módulo Médico: Últimos signos vitales cargados:', latestVital);
        setLatestVitals(latestVital);
      } catch (error) {
        console.error('❌ Error cargando últimos signos vitales en MedicalModule:', error);
      }
    };

    loadLatestVitalSigns();
  }, [mainId]);

 // 🆕 Cargar TODOS los ingresos admisiones desde Firebase
  useEffect(() => {
    const loadLatestIngresos = async () => {
      if (!mainId) return;

      try {
        const historialAdmisionesRef = collection(db, 'admisiones', mainId, 'ingreso_historial');
        const que = query(historialAdmisionesRef, orderBy('createdAt', 'desc'));
        const snapshotIngreso = await getDocs(que);

        if (snapshotIngreso.empty) {
          console.log('📊 Módulo Médico: No hay ingresos guardados');
          return;
        }

        const todosIngresos = snapshotIngreso.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('✅ Módulo Médico: Todos los ingresos cargados:', todosIngresos);
        setLatestIngresos(todosIngresos);
      } catch (error) {
        console.error('❌ Error cargando ingresos en MedicalModule:', error);
      }
    };

    loadLatestIngresos();
  }, [mainId]);


  useEffect(() => {
    if (!admisiones?.createdAt) return;
    const fechaIngreso = admisiones.createdAt.toDate();
    const dias = Math.floor((new Date() - fechaIngreso) / (1000 * 60 * 60 * 24) + 1);
    setEstancia(dias);
  }, [admisiones]);

  useEffect(() => {
    if (!admisiones?.secondaryData?.dateOfBirth) return;
    let fechaNacimiento = admisiones.secondaryData.dateOfBirth;
    fechaNacimiento = fechaNacimiento.toDate ? fechaNacimiento.toDate() : new Date(fechaNacimiento);
    const hoy = new Date();
    let anios = hoy.getFullYear() - fechaNacimiento.getFullYear();
    if (
      hoy.getMonth() < fechaNacimiento.getMonth() ||
      (hoy.getMonth() === fechaNacimiento.getMonth() && hoy.getDate() < fechaNacimiento.getDate())
    ) {
      anios--;
    }
    setEdad(anios);
  }, [admisiones]);

  useEffect(() => {
    if (!activeModalKey) return;
    const onEsc = (event) => event.key === 'Escape' && setActiveModalKey(null);
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [activeModalKey]);

  const openModule = (module) => {
    setModuloActivo(module.title);
    if (!module.modalKey || !modalRegistry[module.modalKey]) {
      toast({ title: 'Esta funcion no esta implementada aun.' });
      return;
    }
    setActiveModalKey(module.modalKey);
  };

  const activeModal = activeModalKey ? modalRegistry[activeModalKey] : null;
  const ActiveModalPageComponent = activeModal?.pageComponent || null;
  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  // 🆕 Generar dinámicamente el resumen vitales desde Firebase
  const dynamicResumenVitales = latestVitals
    ? [
      { label: 'P.A.', value: latestVitals.presion || '--' },
      { label: 'PULSO', value: `${latestVitals.pulso || '--'} lpm` },
      { label: 'TEMP.', value: `${latestVitals.temperatura || '--'} C` },
      { label: 'SAT O2', value: `${latestVitals.satO2 || '--'}%` },
      { label: 'PESO', value: `${latestVitals.peso || '--'} KG` },
      { label: 'F.R.', value: `${latestVitals.fr || '--'}/min` },
    ]
    : resumenVitales; // Fallback a valores por defecto si no hay datos en Firebase

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
      <div className="relative mb-2">
        <button onClick={() => window.history.back()} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#69C9BA] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]">
          ← Volver
        </button>
        <h1 className="text-2xl text-[#69c9ba] font-extrabold tracking-wide text-center">MODULO MEDICO</h1>
      </div>

      <div className="min-h-screen bg-[#76c4d5]/40 p-2">
        <header className="rounded-2xl border border-[#69c9ba]/25 bg-white/85 p-3 shadow-md text-[#595759]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-[#007e8f]/5 p-2">
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Logo Clinica Atlas"
                className="w-36 h-auto"
              />
              <p className="mt-1 text-sm font-bold">{formattedTime}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#007e8f]">
                {formattedDate.toUpperCase()}
              </p>
            </div>
            {loading ? (
              <p>Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p className="font-bold text-sm">
                    {admisiones.firstName} {admisiones.lastName}
                  </p>
                  <p><strong>Identificacion:</strong> {admisiones.cedula}</p>
                  <p><strong>Edad:</strong> {edad}</p>
                  <p><strong>Medico:</strong> {admisiones.medico}</p>
                  <p><strong>Estancia:</strong> {estancia} dias</p>
                </div>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p><strong>Servicio:</strong> {admisiones.servicio}</p>
                  <p><strong>Seguro:</strong> {admisiones.seguro}</p>
                  <p><strong>Alertas:</strong> {admisiones.alergiaUno || 'No registrado'}</p>
                </div>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2 text-center font-semibold">
                  <p>PISO: {admisiones.ubicacion?.piso || 'No Reg'}</p>
                  <p>{admisiones.ubicacion?.habitacion || 'No Reg'}</p>
                </div>
              </>
            ) : (
              <p className="text-red-600 font-bold">No se encontro informacion de admisiones.</p>
            )}
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">

          <Card className="bg-[#76c4d5]/20  rounded-lg p-0 col-span-1 text-sm shadow overflow-hidden">

            <div className=" text-white p-2 flex items-center justify-between bg-gradient-to-r from-[#595759] to-[#7a7a7d]/40">

              <div className="px-4 py-3 border-b border-slate-200 ">
                <h3 className="text-[#ffffff] font-bold text-xl mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />HISTORIAL DE INGRESOS
                </h3>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[290px] pr-1 bg-white">
              <div className="p-2 space-y-1">
                {latestIngresos && Array.isArray(latestIngresos) && latestIngresos.length > 0 ? (
                  latestIngresos.map((ingreso, index) => (
                    <div key={ingreso.id || index} className="rounded-xl border border-[#007e8f]/15 text-[#595759] p-2 text-center font-semibold hover:bg-[#007e8f]/5 transition">
                      <p className="text-sm">{new Date(ingreso.createdAt?.toDate?.() || ingreso.createdAt).toLocaleDateString('es-ES')}</p>
                      {ingreso.nota && <p className="text-[10px] mt-1 text-gray-600">{ingreso.nota}</p>}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-[#007e8f]/15 text-[#595759] p-2 text-center font-semibold">
                    <p>No hay ingresos registrados</p>
                  </div>
                )}
              </div>
  
            </div>


            {/* SIGNOS VITALES CARD */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-1"
            >

              <div className="m-3 bg-gradient-to-br from-[#76c4d5]/20 to-[#69c9ba]/15 rounded-lg p-4 text-sm text-gray-700 border border-[#76c4d5]/30">
                <h3 className="font-semibold text-[#595759] mb-2">SIGNOS VITALES</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dynamicResumenVitales.map((vital) => (
                    <div key={vital.label} className="rounded-md px-2 py-1.5 bg-white text-slate-700">
                      <p className="text-[10px] font-semibold uppercase">{vital.label}</p>
                      <p className="text-xs font-bold">{vital.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>



          </Card>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full col-span-3 bg-white rounded-lg p-5 shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold bg-[#76C4D5] text-white inline-block px-4 py-2 rounded-full w-fit">
                MODULO MEDICO
              </h2>
              <Badge className="w-fit bg-[#595759] text-white hover:bg-[#69C9BA]">
                {moduloActivo ? `Modulo activo: ${moduloActivo}` : 'Selecciona un modulo'}
              </Badge>
            </div>

            <div className="space-y-4">
              {moduloMedicoSecciones.map((section) => (
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
                        key={module.key}
                        type="button"
                        onClick={() => openModule(module)}
                        className={`rounded-xl border p-3 text-left transition hover:shadow-md bg-white ${cardToneClasses[module.tone] || cardToneClasses.primary
                          } ${moduloActivo === module.title
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

      <AnimatePresence>
        {activeModal ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center" onClick={() => setActiveModalKey(null)}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }} className="w-full max-w-[96vw] max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="bg-[#595759] text-[#ffffff]/80 px-5 py-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">{activeModal.title}</h3>
                <button type="button" className="rounded-md bg-white/15 px-2 py-1 text-sm" onClick={() => setActiveModalKey(null)}>✕</button>
              </div>
              <div className="max-h-[84vh] overflow-y-auto bg-[#f8fcff]">
                {ActiveModalPageComponent ? (
                  <div className="embedded-modal-page">
                    <style>{`
                      .embedded-modal-page > .min-h-screen > .relative.mb-2 { display: none !important; }
                      .embedded-modal-page > .min-h-screen > .min-h-screen > header { display: none !important; }
                      .embedded-modal-page > .min-h-screen > .min-h-screen > main {
                        margin-top: .5rem !important;
                        grid-template-columns: 1fr !important;
                      }
                      .embedded-modal-page > .min-h-screen > .min-h-screen > main > :first-child {
                        display: none !important;
                      }
                    `}</style>
                    <ActiveModalPageComponent />
                  </div>
                ) : (
                  <div className="p-5">{activeModal.render?.()}</div>
                )}
              </div>
              <div className="border-t border-[#007e8f]/20 bg-white px-5 py-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveModalKey(null)}>Cerrar</Button>
                {activeModal.showSave ? (
                  <Button onClick={() => toast({ title: `Guardado: ${activeModal.title}` })} className="bg-[#007e8f] text-white hover:bg-[#1c3f6e]">
                    Guardar
                  </Button>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MedicalModulePanel;
