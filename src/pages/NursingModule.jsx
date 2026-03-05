import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartPulse, Heart, Thermometer, Activity, Pill, ClipboardList, Syringe, Stethoscope, Droplets, FileText, BellRing, Scale, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/firebaseConfig';
import { collection, addDoc, doc, getDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

const VITALS_CONFIG = [
  { id: 'presion', label: 'Presion Arterial', shortLabel: 'P.A.', icon: HeartPulse, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', unit: 'mmHg', ref: '90-120/60-80', initial: '148/95' },
  { id: 'pulso', label: 'Frecuencia Cardiaca', shortLabel: 'PULSO', icon: Heart, iconClass: 'text-red-500', iconBgClass: 'bg-red-100', unit: 'lpm', ref: '60-100', initial: '88' },
  { id: 'temperatura', label: 'Temperatura', shortLabel: 'TEMP.', icon: Thermometer, iconClass: 'text-orange-500', iconBgClass: 'bg-orange-100', unit: 'C', ref: '36-37.5', initial: '37.8' },
  { id: 'satO2', label: 'Saturacion O2', shortLabel: 'SAT O2', icon: Activity, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', unit: '%', ref: '95-100', initial: '94' },
  { id: 'peso', label: 'Peso', shortLabel: 'PESO', icon: Scale, iconClass: 'text-green-600', iconBgClass: 'bg-green-100', unit: 'KG', ref: '--', initial: '78' },
  { id: 'fr', label: 'Frecuencia Respiratoria', shortLabel: 'F.R.', icon: Stethoscope, iconClass: 'text-teal-600', iconBgClass: 'bg-teal-100', unit: '/min', ref: '12-20', initial: '22' },
  { id: 'glucosa', label: 'Glucemia', shortLabel: 'GLUC.', icon: Droplets, iconClass: 'text-purple-600', iconBgClass: 'bg-purple-100', unit: 'mg/dL', ref: '70-100', initial: '126' },
  { id: 'diuresis', label: 'Diuresis', shortLabel: 'DIUR.', icon: Droplets, iconClass: 'text-sky-600', iconBgClass: 'bg-sky-100', unit: 'mL/turno', ref: '0.5-1 mL/kg/h', initial: '1200' },
];

const MODULO_ENFERMERIA_SECCIONES = [
  {
    title: 'URGENTE - CON ALERTAS ACTIVAS DEL MODULO MEDICO',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      { key: 'signos_vitales', modalId: 'signos_vitales', title: 'Signos Vitales', description: 'PA 148/95 - SAT 94% - Temp 37.8 C', status: 'Ultimo registro: 12:00', icon: HeartPulse, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', badge: 'Alerta', badgeClass: 'bg-red-100 text-red-700', tone: 'danger' },
      { key: 'registro_med', modalId: 'registro_med', title: 'Registro Medicacion', description: 'Administracion y descargo de farmacos', status: '11:00 pendiente', icon: Pill, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', badge: '1 atrasada', badgeClass: 'bg-red-100 text-red-700', tone: 'danger' },
      { key: 'descargo_med', modalId: 'descargo_med', title: 'Descargo Medicacion', description: 'Consumo y egreso de stock farmacologico', status: '3 items', icon: ClipboardList, iconClass: 'text-purple-600', iconBgClass: 'bg-purple-100', badge: 'Pendiente', badgeClass: 'bg-amber-100 text-amber-700', tone: 'warning' },
      { key: 'enviar_alerta', modalId: 'enviar_alerta', title: 'Enviar Alerta al Medico', description: 'Comunicacion directa con medico tratante', status: 'Dr. Varela en linea', icon: BellRing, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', badge: 'Al Medico', badgeClass: 'bg-indigo-100 text-indigo-700', tone: 'primary' },
    ],
  },
  {
    title: 'CUIDADO DIRECTO DEL PACIENTE',
    gridClass: 'md:grid-cols-2 xl:grid-cols-3',
    modules: [
      { key: 'ingesta_eliminacion', modalId: 'ingesta_eliminacion', title: 'Ingesta y Eliminacion', description: 'Control de balance hidrico y diuresis', status: 'Hoy: 1.8L / 2.0L', icon: Droplets, iconClass: 'text-sky-600', iconBgClass: 'bg-sky-100', badge: 'Balance: -200ml', badgeClass: 'bg-teal-100 text-teal-700', tone: 'teal' },
      { key: 'hidratacion', modalId: 'hidratacion', title: 'Hidratacion IV', description: 'Monitoreo y control de infusiones', status: '500mL x 42 gts/min', icon: Syringe, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', tone: 'info' },
      { key: 'registro_oxigeno', modalId: 'registro_oxigeno', title: 'Registro Oxigeno', description: 'Oxigenoterapia, sat y dispositivos', status: 'Canula 2 L/min', icon: Activity, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', badge: 'SAT 94%', badgeClass: 'bg-amber-100 text-amber-700', tone: 'warning' },
      { key: 'informe_enf', modalId: 'informe_enf', title: 'Informe Enfermeria', description: 'Notas de turno y evolucion enfermeria', status: 'Ultimo: 08:00', icon: ClipboardList, iconClass: 'text-purple-600', iconBgClass: 'bg-purple-100', tone: 'pink' },
      { key: 'dietas', modalId: 'dietas', title: 'Solicitud de Dietas', description: 'Regimen alimenticio y restricciones', status: 'Dieta blanda activa', icon: ClipboardList, iconClass: 'text-green-600', iconBgClass: 'bg-green-100', tone: 'success' },
      { key: 'screen_rn', modalId: 'screen_rn', title: 'Screen RN', description: 'Monitoreo continuo de parametros', status: 'Ver monitoreo', icon: Activity, iconClass: 'text-indigo-600', iconBgClass: 'bg-indigo-100', tone: 'info' },
    ],
  },
  {
    title: 'AREA QUIRURGICA Y RECUPERACION',
    gridClass: 'md:grid-cols-2 xl:grid-cols-4',
    modules: [
      { key: 'preq_enf', modalId: 'preq_enf', title: 'Pre-Quirurgico Enfermeria', description: 'Preparacion del paciente para cirugia', status: 'Pendiente', icon: ClipboardList, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', tone: 'danger' },
      { key: 'informe_rec', modalId: 'informe_rec', title: 'Informe de Recuperacion', description: 'Registro de UCI post-operatoria', status: 'Sin registro', icon: FileText, iconClass: 'text-indigo-600', iconBgClass: 'bg-indigo-100', tone: 'neutral' },
      { key: 'parte_op', modalId: 'parte_op', title: 'Parte Operatorio', description: 'Reporte de sala de operaciones', status: 'Ver parte', icon: FileText, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', tone: 'primary' },
      { key: 'guia_enf', modalId: 'guia_enf', title: 'Guia de Enfermeria', description: 'Protocolos y referencias', status: 'Ver protocolos', icon: Stethoscope, iconClass: 'text-emerald-600', iconBgClass: 'bg-emerald-100', tone: 'success' },
    ],
  },
  {
    title: 'ADMINISTRATIVO',
    gridClass: 'md:grid-cols-2',
    modules: [
      { key: 'cargo_cuenta', modalId: 'cargo_cuenta', title: 'Cargo a Cuenta', description: 'Registro de consumos para facturacion', status: '3 items pendientes', icon: ClipboardList, iconClass: 'text-teal-600', iconBgClass: 'bg-teal-100', badge: 'Activo', badgeClass: 'bg-teal-100 text-teal-700', tone: 'teal' },
      { key: 'alertas_centro', modalId: 'alertas_centro', title: 'Centro de Alertas Medico - Enfermeria', description: 'Panel de comunicacion bidireccional', status: '3 alertas activas', icon: AlertTriangle, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', badge: 'Interconectado', badgeClass: 'bg-sky-100 text-sky-700', tone: 'info' },
    ],
  },
];

const CARD_TONE_CLASSES = {
  danger: 'border-red-200 hover:border-red-400',
  warning: 'border-amber-200 hover:border-amber-400',
  primary: 'border-indigo-200 hover:border-indigo-400',
  success: 'border-emerald-200 hover:border-emerald-400',
  info: 'border-sky-200 hover:border-sky-400',
  teal: 'border-teal-200 hover:border-teal-400',
  pink: 'border-pink-200 hover:border-pink-400',
  neutral: 'border-slate-200 hover:border-slate-400',
};

const MODAL_INPUT_CLASS = 'mt-1 w-full rounded-lg border border-[#007e8f]/25 bg-white px-3 py-2 text-sm text-[#1c3f6e] outline-none focus:border-[#007e8f]';

const FORM_MODAL_CONFIG = {
  registro_med: {
    sectionTitle: 'Registro y Administracion de Medicacion',
    fields: [
      { name: 'medicamento', label: 'Medicamento', type: 'text' },
      { name: 'dosisVia', label: 'Dosis / Via', type: 'text' },
      { name: 'hora', label: 'Hora', type: 'time' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', fullWidth: true },
    ],
  },
  descargo_med: {
    sectionTitle: 'Descargo de Medicacion',
    fields: [
      { name: 'medicamento', label: 'Medicamento', type: 'text' },
      { name: 'presentacion', label: 'Presentacion', type: 'text' },
      { name: 'cantidadUsada', label: 'Cant. usada', type: 'number' },
      { name: 'motivo', label: 'Motivo', type: 'text' },
      { name: 'enfermera', label: 'Enfermera que descarga', type: 'text' },
      { name: 'turno', label: 'Turno', type: 'select', options: ['Manana (07:00-19:00)', 'Noche (19:00-07:00)'] },
    ],
  },
  ingesta_eliminacion: {
    sectionTitle: 'Ingesta y Eliminacion',
    fields: [
      { name: 'ingestaTotal', label: 'Ingesta total (mL)', type: 'number' },
      { name: 'eliminacionTotal', label: 'Eliminacion total (mL)', type: 'number' },
      { name: 'balanceFinal', label: 'Balance final (mL)', type: 'number' },
      { name: 'detalle', label: 'Detalle / observaciones', type: 'textarea', fullWidth: true },
    ],
  },
  hidratacion: {
    sectionTitle: 'Hidratacion IV',
    fields: [
      { name: 'solucion', label: 'Solucion', type: 'text' },
      { name: 'volumen', label: 'Volumen (mL)', type: 'number' },
      { name: 'aditivos', label: 'Aditivos', type: 'text' },
      { name: 'velocidad', label: 'Velocidad (gts/min)', type: 'number' },
      { name: 'acceso', label: 'Acceso vascular', type: 'select', options: ['Via periferica', 'CVC', 'PICC'] },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', fullWidth: true },
    ],
  },
  registro_oxigeno: {
    sectionTitle: 'Registro Oxigeno',
    fields: [
      { name: 'dispositivo', label: 'Dispositivo', type: 'select', options: ['Sin O2', 'Canula binasal', 'Mascarilla simple', 'Mascarilla Venturi', 'CPAP/BiPAP'] },
      { name: 'flujo', label: 'Flujo O2 (L/min)', type: 'number' },
      { name: 'fio2', label: 'FiO2 estimado', type: 'text' },
      { name: 'sat', label: 'SAT O2 (%)', type: 'number' },
      { name: 'fr', label: 'Frecuencia respiratoria', type: 'number' },
      { name: 'nota', label: 'Observaciones', type: 'textarea', fullWidth: true },
    ],
  },
  informe_enf: {
    sectionTitle: 'Informe de Enfermeria',
    fields: [
      { name: 'fecha', label: 'Fecha', type: 'date' },
      { name: 'turno', label: 'Turno', type: 'select', options: ['Manana 07:00-19:00', 'Noche 19:00-07:00'] },
      { name: 'estadoGeneral', label: 'Estado general', type: 'textarea', fullWidth: true },
      { name: 'cuidados', label: 'Cuidados realizados', type: 'textarea', fullWidth: true },
      { name: 'novedades', label: 'Novedades / incidentes', type: 'textarea', fullWidth: true },
    ],
  },
  dietas: {
    sectionTitle: 'Solicitud de Dietas',
    fields: [
      { name: 'tipoDieta', label: 'Tipo de dieta', type: 'select', options: ['Normal / Sin restriccion', 'Blanda', 'Liquida', 'Liquida clara', 'Hiposodica', 'Diabetica', 'Ayuno'] },
      { name: 'restricciones', label: 'Restricciones especificas', type: 'text' },
      { name: 'desayuno', label: 'Desayuno', type: 'time' },
      { name: 'almuerzo', label: 'Almuerzo', type: 'time' },
      { name: 'merienda', label: 'Merienda', type: 'time' },
      { name: 'indicaciones', label: 'Indicaciones especiales', type: 'textarea', fullWidth: true },
    ],
  },
  screen_rn: {
    sectionTitle: 'Screen RN - Monitoreo Continuo',
    fields: [
      { name: 'pa', label: 'PA', type: 'text' },
      { name: 'fc', label: 'FC', type: 'number' },
      { name: 'sat', label: 'SAT O2', type: 'number' },
      { name: 'temperatura', label: 'Temperatura', type: 'text' },
      { name: 'fr', label: 'F. Resp.', type: 'number' },
      { name: 'observaciones', label: 'Observaciones de monitoreo', type: 'textarea', fullWidth: true },
    ],
  },
  preq_enf: {
    sectionTitle: 'Pre-Quirurgico Enfermeria',
    fields: [
      { name: 'checklist', label: 'Checklist pre-quirurgico', type: 'textarea', fullWidth: true },
      { name: 'horaCirugia', label: 'Hora programada cirugia', type: 'time' },
      { name: 'quirofano', label: 'Quirofano', type: 'select', options: ['Q1 - General', 'Q2 - Emergencias', 'Q3 - Laparoscopia'] },
      { name: 'observaciones', label: 'Observaciones pre-quirurgicas', type: 'textarea', fullWidth: true },
    ],
  },
  informe_rec: {
    sectionTitle: 'Informe de Recuperacion Post-Operatoria',
    fields: [
      { name: 'llegada', label: 'Llegada a recuperacion', type: 'time' },
      { name: 'aldreteIngreso', label: 'Score Aldrete ingreso', type: 'number' },
      { name: 'aldreteEgreso', label: 'Score Aldrete egreso', type: 'number' },
      { name: 'pa', label: 'PA', type: 'text' },
      { name: 'fc', label: 'FC', type: 'number' },
      { name: 'sat', label: 'SAT O2', type: 'number' },
      { name: 'observaciones', label: 'Observaciones de recuperacion', type: 'textarea', fullWidth: true },
    ],
  },
  parte_op: {
    sectionTitle: 'Parte Operatorio',
    fields: [
      { name: 'quirofano', label: 'Numero de quirofano', type: 'select', options: ['Q1 - General', 'Q2 - Emergencias', 'Q3 - Laparoscopia'] },
      { name: 'cirujano', label: 'Cirujano principal', type: 'text' },
      { name: 'inicio', label: 'Inicio de cirugia', type: 'time' },
      { name: 'fin', label: 'Fin de cirugia', type: 'time' },
      { name: 'procedimiento', label: 'Procedimiento realizado', type: 'text' },
      { name: 'recuento', label: 'Recuento de material', type: 'textarea', fullWidth: true },
      { name: 'incidentes', label: 'Incidentes / observaciones', type: 'textarea', fullWidth: true },
    ],
  },
  guia_enf: {
    sectionTitle: 'Guia de Enfermeria',
    fields: [
      { name: 'busqueda', label: 'Buscar protocolo', type: 'text' },
      { name: 'nota', label: 'Nota rapida', type: 'textarea', fullWidth: true },
    ],
  },
  cargo_cuenta: {
    sectionTitle: 'Cargo a Cuenta',
    fields: [
      { name: 'codigo', label: 'Codigo', type: 'text' },
      { name: 'descripcion', label: 'Descripcion', type: 'text' },
      { name: 'cantidad', label: 'Cantidad', type: 'number' },
      { name: 'precio', label: 'Precio unitario', type: 'number' },
      { name: 'comentario', label: 'Comentario administrativo', type: 'textarea', fullWidth: true },
    ],
  },
};

function createInitialForms() {
  const now = new Date();
  const horaActual = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fechaActual = now.toISOString().slice(0, 10);

  const forms = {
    signos_vitales: {
      values: VITALS_CONFIG.reduce((acc, item) => ({ ...acc, [item.id]: item.initial }), {}),
      enfermera: 'ENF. PATRICIA GUAMAN',
      hora: horaActual,
      observaciones: '',
    },
    enviar_alerta: { destinatario: 'medico', prioridad: 'urgente', mensaje: '' },
    alertas_centro: { filtro: 'todas', notaCierre: '' },
  };

  Object.entries(FORM_MODAL_CONFIG).forEach(([key, config]) => {
    if (!forms[key]) forms[key] = {};
    config.fields.forEach((field) => {
      if (forms[key][field.name] !== undefined) return;
      if (field.type === 'select') forms[key][field.name] = field.options[0] || '';
      else if (field.type === 'date') forms[key][field.name] = fechaActual;
      else forms[key][field.name] = '';
    });
  });

  return forms;
}

function createInitialAlerts() {
  return [
    { id: 'a1', level: 'critica', title: 'PA elevada 148/95', description: 'Requiere evaluacion medica inmediata.', source: 'SIS', time: '12:15' },
    { id: 'a2', level: 'advertencia', title: 'Medicacion 11:00 pendiente', description: 'Amoxicilina 500mg pendiente de administracion.', source: 'SIS', time: '11:32' },
    { id: 'a3', level: 'info', title: 'Nueva orden medica', description: 'Solicita ECG urgente.', source: 'MED', time: '09:45' },
  ];
}

function createInitialAlertHistory() {
  return [
    { id: 'h1', from: 'Dr. Varela', to: 'Enf. Guaman', message: 'Solicito ECG urgente. PA elevada, monitorear cada 30 min.', time: '12:15' },
    { id: 'h2', from: 'Enf. Guaman', to: 'Dr. Varela', message: 'PA 148/95 registrada, paciente con cefalea leve.', time: '11:32' },
    { id: 'h3', from: 'Dr. Varela', to: 'Enf. Guaman', message: 'Ajustar dieta a blanda hasta nueva evaluacion.', time: '09:45' },
  ];
}

function isVitalAlert(vitalId, value) {
  if (vitalId === 'presion') {
    const [sysRaw, diaRaw] = String(value).split('/');
    const sys = Number(sysRaw);
    const dia = Number(diaRaw);
    if (Number.isNaN(sys) || Number.isNaN(dia)) return false;
    return sys > 140 || dia > 90;
  }

  const numeric = Number(String(value).replace(',', '.'));
  if (Number.isNaN(numeric)) return false;
  if (vitalId === 'satO2') return numeric < 95;
  if (vitalId === 'temperatura') return numeric > 37.5;
  if (vitalId === 'fr') return numeric < 12 || numeric > 20;
  return false;
}

function ModalSection({
  title,
  icon: Icon,
  iconClass = 'text-[#007e8f]',
  iconBgClass = 'bg-[#007e8f]/10',
  children,
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 border-b border-[#007e8f]/20 pb-1 text-xs font-bold uppercase tracking-wide text-[#1c3f6e]">
        {Icon ? (
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${iconBgClass}`}>
            <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
          </span>
        ) : null}
        {title}
      </h4>
      {children}
    </div>
  );
}

function DynamicField({ field, value, onChange }) {
  if (field.type === 'textarea') {
    return (
      <label className="block text-xs font-semibold text-[#1c3f6e]">
        {field.label}
        <textarea className={`${MODAL_INPUT_CLASS} min-h-[90px]`} value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="block text-xs font-semibold text-[#1c3f6e]">
        {field.label}
        <select className={MODAL_INPUT_CLASS} value={value} onChange={(event) => onChange(event.target.value)}>
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="block text-xs font-semibold text-[#1c3f6e]">
      {field.label}
      <input type={field.type} className={MODAL_INPUT_CLASS} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function GenericModalContent({ modalId, forms, updateField }) {
  const config = FORM_MODAL_CONFIG[modalId];
  const modalMeta = MODALS[modalId];
  if (!config) return null;

  return (
    <ModalSection
      title={config.sectionTitle}
      icon={modalMeta?.icon || ClipboardList}
      iconClass={modalMeta?.iconClass}
      iconBgClass={modalMeta?.iconBgClass}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
            <DynamicField
              field={field}
              value={forms[modalId][field.name]}
              onChange={(value) => updateField(modalId, field.name, value)}
            />
          </div>
        ))}
      </div>
    </ModalSection>
  );
}
function SignosVitalesContent({ forms, updateField, updateVitalValue, onSendAlert }) {
  const vitals = forms.signos_vitales.values;
  const hasCritical = VITALS_CONFIG.some((item) => isVitalAlert(item.id, vitals[item.id]));

  return (
    <div className="space-y-4">
      {hasCritical ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-bold">Valores fuera de rango detectados</p>
          <p>Verifica presion arterial y saturacion O2. Puedes enviar alerta inmediata.</p>
        </div>
      ) : null}

      <ModalSection title="Registro de Signos Vitales" icon={HeartPulse} iconClass="text-red-600" iconBgClass="bg-red-100">
        <div className="space-y-2">
          {VITALS_CONFIG.map((vital) => {
            const Icon = vital.icon;
            const inAlert = isVitalAlert(vital.id, vitals[vital.id]);
            return (
              <div key={vital.id} className={`grid grid-cols-1 font-semibold text-[#1c3f6e] gap-2 rounded-lg border px-3 py-2 md:grid-cols-[1.3fr_1fr] ${inAlert ? 'border-red-300 bg-red-50/70' : 'border-[#007e8f]/20 bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${vital.iconBgClass}`}>
                    <Icon className={`h-4 w-4 ${vital.iconClass}`} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1c3f6e]">{vital.label}</p>
                    <p className="text-xs text-slate-500">Ref: {vital.ref}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full rounded-md border border-[#007e8f]/25 px-2 py-1.5 text-sm"
                    value={vitals[vital.id]}
                    onChange={(event) => updateVitalValue(vital.id, event.target.value)}
                  />
                  <span className="text-xs font-semibold text-slate-500">{vital.unit}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${inAlert ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {inAlert ? 'ALERTA' : 'OK'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ModalSection>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Enfermera
          <input className={MODAL_INPUT_CLASS} value={forms.signos_vitales.enfermera} onChange={(event) => updateField('signos_vitales', 'enfermera', event.target.value)} />
        </label>
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Hora de registro
          <input type="time" className={MODAL_INPUT_CLASS} value={forms.signos_vitales.hora} onChange={(event) => updateField('signos_vitales', 'hora', event.target.value)} />
        </label>
      </div>

      <label className="block text-xs font-semibold text-[#1c3f6e]">
        Observaciones
        <textarea className={`${MODAL_INPUT_CLASS} min-h-[90px]`} value={forms.signos_vitales.observaciones} onChange={(event) => updateField('signos_vitales', 'observaciones', event.target.value)} />
      </label>

      <div className="grid gap-2 md:grid-cols-2">
        <button
          type="button"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-600 hover:text-white"
          onClick={() => onSendAlert('critica', `PA ${vitals.presion} | SAT ${vitals.saturacion}%`, 'Dr. Varela')}
        >
          Alertar medico urgente
        </button>
        <button
          type="button"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-200"
          onClick={() => onSendAlert('advertencia', 'Signos vitales actualizados para revision medica.', 'Dr. Varela')}
        >
          Enviar al medico
        </button>
      </div>
    </div>
  );
}

function AlertComposerContent({ forms, updateField, onSendAlert, alertHistory }) {
  const section = forms.enviar_alerta;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-[#007e8f]/20 bg-[#e7f5f2] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#007e8f]">Dr. Ignacio Varela</p>
          <p className="mt-1 text-sm font-semibold text-[#1c3f6e]">En linea</p>
          <p className="text-xs text-slate-500">Ultimo acceso: hace 3 min</p>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Enf. Patricia Guaman</p>
          <p className="mt-1 text-sm font-semibold text-[#1c3f6e]">Turno activo</p>
          <p className="text-xs text-slate-500">Turno manana 07:00 - 19:00</p>
        </div>
      </div>

      <ModalSection title="Historial de Alertas Recientes" icon={BellRing} iconClass="text-red-600" iconBgClass="bg-red-100">
        <div className="max-h-[170px] space-y-2 overflow-y-auto pr-1">
          {alertHistory.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-[#007e8f]/15 bg-white p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-[#1c3f6e]">{entry.from} → {entry.to}</p>
                <span className="text-slate-500">{entry.time}</span>
              </div>
              <p className="mt-1 text-slate-600">{entry.message}</p>
            </div>
          ))}
        </div>
      </ModalSection>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Destinatario
          <select className={MODAL_INPUT_CLASS} value={section.destinatario} onChange={(event) => updateField('enviar_alerta', 'destinatario', event.target.value)}>
            <option value="medico">Dr. Varela</option>
            <option value="equipo">Todo el equipo</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Prioridad
          <select className={MODAL_INPUT_CLASS} value={section.prioridad} onChange={(event) => updateField('enviar_alerta', 'prioridad', event.target.value)}>
            <option value="urgente">Urgente</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
      </div>

      <label className="block text-xs font-semibold text-[#1c3f6e]">
        Mensaje
        <textarea className={`${MODAL_INPUT_CLASS} min-h-[110px]`} value={section.mensaje} onChange={(event) => updateField('enviar_alerta', 'mensaje', event.target.value)} />
      </label>

      <button 
        type="button" 
        disabled={isSavingFirebase}
        className="w-full rounded-lg bg-[#1c3f6e] px-4 py-2 text-sm font-bold text-white hover:bg-[#007e8f] disabled:opacity-50 disabled:cursor-not-allowed" 
        onClick={() => onSendAlert(section.prioridad, section.mensaje, section.destinatario === 'medico' ? 'Dr. Varela' : 'Todo el equipo')}
      >
        {isSavingFirebase ? 'Guardando signos vitales...' : 'Enviar alerta ahora'}
      </button>
    </div>
  );
}

function AlertCenterContent({ forms, updateField, systemAlerts, onResolveAlert }) {
  const summary = systemAlerts.reduce((acc, alert) => {
    if (alert.level === 'critica') acc.critica += 1;
    else if (alert.level === 'advertencia') acc.advertencia += 1;
    else acc.info += 1;
    return acc;
  }, { critica: 0, advertencia: 0, info: 0 });

  const filter = forms.alertas_centro.filtro;
  const visibleAlerts = filter === 'todas' ? systemAlerts : systemAlerts.filter((item) => item.level === filter);

  return (
    <div className="space-y-4">
      <ModalSection title="Resumen de Alertas" icon={AlertTriangle} iconClass="text-red-600" iconBgClass="bg-red-100">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center"><p className="text-2xl font-black text-red-600">{summary.critica}</p><p className="text-xs font-bold uppercase text-red-700">Criticas</p></div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center"><p className="text-2xl font-black text-amber-600">{summary.advertencia}</p><p className="text-xs font-bold uppercase text-amber-700">Advertencias</p></div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-center"><p className="text-2xl font-black text-sky-600">{summary.info}</p><p className="text-xs font-bold uppercase text-sky-700">Informacion</p></div>
      </div>
      </ModalSection>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Filtro
          <select className={MODAL_INPUT_CLASS} value={filter} onChange={(event) => updateField('alertas_centro', 'filtro', event.target.value)}>
            <option value="todas">Todas</option>
            <option value="critica">Criticas</option>
            <option value="advertencia">Advertencias</option>
            <option value="info">Informacion</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-[#1c3f6e]">
          Nota de cierre
          <input className={MODAL_INPUT_CLASS} value={forms.alertas_centro.notaCierre} onChange={(event) => updateField('alertas_centro', 'notaCierre', event.target.value)} />
        </label>
      </div>

      <ModalSection title="Alertas activas" icon={BellRing} iconClass="text-red-600" iconBgClass="bg-red-100">
      <div className="space-y-2">
        {visibleAlerts.map((alert) => {
          const tone = alert.level === 'critica' ? 'border-red-200 bg-red-50' : alert.level === 'advertencia' ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50';
          return (
            <div key={alert.id} className={`rounded-lg border p-3 text-xs ${tone}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#1c3f6e]">{alert.title}</p>
                  <p className="text-slate-600">{alert.description}</p>
                  <p className="mt-1 font-semibold text-slate-500">{alert.source} · {alert.time}</p>
                </div>
                <button type="button" className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100" onClick={() => onResolveAlert(alert.id)}>
                  Resolver
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </ModalSection>
    </div>
  );
}

const MODALS = {
  signos_vitales: { title: 'Signos Vitales', icon: HeartPulse, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', content: SignosVitalesContent, showSave: true },
  registro_med: { title: 'Registro Medicacion', icon: Pill, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', content: GenericModalContent, showSave: true },
  descargo_med: { title: 'Descargo Medicacion', icon: ClipboardList, iconClass: 'text-purple-600', iconBgClass: 'bg-purple-100', content: GenericModalContent, showSave: true },
  ingesta_eliminacion: { title: 'Ingesta y Eliminacion', icon: Droplets, iconClass: 'text-sky-600', iconBgClass: 'bg-sky-100', content: GenericModalContent, showSave: true },
  hidratacion: { title: 'Hidratacion IV', icon: Syringe, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', content: GenericModalContent, showSave: true },
  registro_oxigeno: { title: 'Registro Oxigeno', icon: Activity, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', content: GenericModalContent, showSave: true },
  informe_enf: { title: 'Informe Enfermeria', icon: ClipboardList, iconClass: 'text-purple-600', iconBgClass: 'bg-purple-100', content: GenericModalContent, showSave: true },
  dietas: { title: 'Solicitud de Dietas', icon: ClipboardList, iconClass: 'text-green-600', iconBgClass: 'bg-green-100', content: GenericModalContent, showSave: true },
  screen_rn: { title: 'Screen RN', icon: Activity, iconClass: 'text-indigo-600', iconBgClass: 'bg-indigo-100', content: GenericModalContent, showSave: true },
  preq_enf: { title: 'Pre-Quirurgico Enfermeria', icon: ClipboardList, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', content: GenericModalContent, showSave: true },
  informe_rec: { title: 'Informe de Recuperacion', icon: FileText, iconClass: 'text-indigo-600', iconBgClass: 'bg-indigo-100', content: GenericModalContent, showSave: true },
  parte_op: { title: 'Parte Operatorio', icon: FileText, iconClass: 'text-blue-600', iconBgClass: 'bg-blue-100', content: GenericModalContent, showSave: true },
  guia_enf: { title: 'Guia de Enfermeria', icon: Stethoscope, iconClass: 'text-emerald-600', iconBgClass: 'bg-emerald-100', content: GenericModalContent, showSave: true },
  cargo_cuenta: { title: 'Cargo a Cuenta', icon: ClipboardList, iconClass: 'text-teal-600', iconBgClass: 'bg-teal-100', content: GenericModalContent, showSave: true },
  enviar_alerta: { title: 'Centro de Alertas - Medico y Enfermeria', icon: AlertTriangle, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', content: AlertComposerContent, showSave: false },
  alertas_centro: { title: 'Centro de Alertas Activas', icon: AlertTriangle, iconClass: 'text-red-600', iconBgClass: 'bg-red-100', content: AlertCenterContent, showSave: true },
};

const NurseModulePanel = () => {
  const { mainId } = useParams();
  const { user, profile } = useAuth();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historialActivo, setHistorialActivo] = useState(0);
  const [moduloActivo, setModuloActivo] = useState('');
  const [activeModalId, setActiveModalId] = useState(null);
  const [forms, setForms] = useState(createInitialForms);
  const [systemAlerts, setSystemAlerts] = useState(createInitialAlerts);
  const [alertHistory, setAlertHistory] = useState(createInitialAlertHistory);
  const [firebaseDraft, setFirebaseDraft] = useState({});
  const [isSavingFirebase, setIsSavingFirebase] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
        setAdmisiones(null);
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
          console.log('📊 No hay signos vitales guardados aún');
          return;
        }

        const latestVital = snapshot.docs[0].data();
        console.log('✅ Últimos signos vitales cargados desde Firebase:', latestVital);

        // Actualizar el estado con los valores más recientes
        setForms((prev) => ({
          ...prev,
          signos_vitales: {
            ...prev.signos_vitales,
            values: {
              presion: latestVital.presion || '',
              pulso: latestVital.pulso || '',
              temperatura: latestVital.temperatura || '',
              satO2: latestVital.satO2 || '',
              glucosa: latestVital.glucosa || '',
              peso: latestVital.peso || '',
              fr: latestVital.fr || '',
              diuresis: latestVital.diuresis || '',
            },
          },
        }));
      } catch (error) {
        console.error('❌ Error cargando últimos signos vitales:', error);
      }
    };

    loadLatestVitalSigns();
  }, [mainId]);

  useEffect(() => {
    if (!activeModalId) return;
    const onEsc = (event) => event.key === 'Escape' && setActiveModalId(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [activeModalId]);

  useEffect(() => {
    setFirebaseDraft({
      module: 'enfermeria',
      admisionId: mainId || null,
      updatedAt: new Date().toISOString(),
      payload: { forms, systemAlerts, alertHistory },
    });
  }, [forms, mainId, systemAlerts, alertHistory]);

  /**
   * Guarda los signos vitales en la subcolección vital_signs
   * Estructura: admisiones/{admissionId}/vital_signs/{vitalId}
   */
  const saveVitalSigns = async () => {
    try {
      // VERIFICACIÓN 1: ID de admisión
      console.log('🔍 [VERIFICACIÓN 1] ID de Admisión:', mainId);
      if (!mainId) {
        console.error('❌ mainId es undefined o null');
        toast({ title: 'Error', description: 'No se encontró el ID de la admisión.' });
        return;
      }

      // VERIFICACIÓN 2: Usuario y perfil
      console.log('🔍 [VERIFICACIÓN 2] Usuario:', { uid: user?.uid, nombre: profile?.nombre, rol: profile?.rol });
      if (!user || !profile) {
        console.error('❌ Usuario o perfil no encontrado:', { user: !!user, profile: !!profile });
        toast({ title: 'Error', description: 'Usuario no autenticado.' });
        return;
      }

      setIsSavingFirebase(true);

      const vitals = forms.signos_vitales.values;

      // VERIFICACIÓN 3: Datos ingresados
      const hasData = Object.values(vitals).some((val) => val !== '' && val !== null);
      console.log('🔍 [VERIFICACIÓN 3] Datos ingresados:', { vitals, hasData });
      if (!hasData) {
        toast({ title: 'Error', description: 'Por favor ingresa al menos un signo vital.' });
        setIsSavingFirebase(false);
        return;
      }

      // Preparar el documento de signos vitales
      const vitalData = {
        presion: vitals.presion || null,
        pulso: vitals.pulso ? Number(vitals.pulso) : null,
        temperatura: vitals.temperatura ? Number(vitals.temperatura) : null,
        satO2: vitals.satO2 ? Number(vitals.satO2) : null,
        glucosa: vitals.glucosa ? Number(vitals.glucosa) : null,
        peso: vitals.peso ? Number(vitals.peso) : null,
        fr: vitals.fr ? Number(vitals.fr) : null,
        diuresis: vitals.diuresis ? Number(vitals.diuresis) : null,
        enfermera: forms.signos_vitales.enfermera || profile.nombre || 'Enfermera Sin Nombre',
        nurseUid: user.uid,
        observaciones: forms.signos_vitales.observaciones || '',
        horaRegistro: forms.signos_vitales.hora || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
        createdAt: serverTimestamp(),
      };

      console.log('📝 [PASO 4] Documento preparado:', vitalData);

      // Referenciar la subcolección vital_signs dentro de la admisión
      const vitalSignsRef = collection(db, 'admisiones', mainId, 'vital_signs');
      console.log('📍 [PASO 5] Referencia de colección:', `admisiones/${mainId}/vital_signs`);

      // Guardar el documento
      console.log('⏳ [PASO 6] Enviando solicitud a Firebase...');
      const docRef = await addDoc(vitalSignsRef, vitalData);

      console.log('✅ [ÉXITO] Signos vitales guardados en Firebase:', {
        admissionId: mainId,
        docId: docRef.id,
        data: vitalData,
        route: `admisiones/${mainId}/vital_signs/${docRef.id}`,
      });

      toast({
        title: 'Éxito',
        description: `Signos vitales guardados correctamente (${docRef.id})`,
      });

      // Limpiar el formulario después de guardar
      setForms((prev) => ({
        ...prev,
        signos_vitales: {
          ...prev.signos_vitales,
          values: VITALS_CONFIG.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {}),
        },
      }));

      return docRef.id;
    } catch (error) {
      console.error('❌ [ERROR] Detalles del error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      let errorDescription = 'No fue posible guardar los signos vitales en Firebase.';
      
      if (error.code === 'permission-denied') {
        errorDescription = '⚠️ Permiso denegado. Verifica que las reglas de Firestore estén desplegadas.';
      } else if (error.code === 'unavailable') {
        errorDescription = '⚠️ Firebase no está disponible. Verifica tu conexión.';
      } else if (error.code === 'unauthenticated') {
        errorDescription = '⚠️ Usuario no autenticado. Vuelve a iniciar sesión.';
      }

      toast({
        title: 'Error al guardar',
        description: errorDescription,
      });
    } finally {
      setIsSavingFirebase(false);
    }
  };

  /**
   * Función genérica para guardar datos clínicos en subcolecciones
   * Preparada para futuras extensiones: nursing_notes, medication_records, etc.
   */
  const saveClinicalData = async (collectionName, data) => {
    try {
      if (!mainId || !user) {
        toast({ title: 'Error', description: 'Datos insuficientes para guardar.' });
        return;
      }

      setIsSavingFirebase(true);

      const clinicalRef = collection(db, 'admisiones', mainId, collectionName);
      const docWithMetadata = {
        ...data,
        nurseUid: user.uid,
        nurseName: profile?.nombre || 'Enfermera Sin Nombre',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(clinicalRef, docWithMetadata);

      console.log(`✅ Datos guardados en ${collectionName}:`, {
        admissionId: mainId,
        docId: docRef.id,
      });

      toast({
        title: 'Éxito',
        description: `Registro guardado en ${collectionName}`,
      });

      return docRef.id;
    } catch (error) {
      console.error(`❌ Error al guardar en ${collectionName}:`, error);
      toast({
        title: 'Error',
        description: `No fue posible guardar en ${collectionName}`,
      });
    } finally {
      setIsSavingFirebase(false);
    }
  };

  const updateField = (section, field, value) => {
    setForms((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateVitalValue = (vitalId, value) => {
    setForms((prev) => ({
      ...prev,
      signos_vitales: {
        ...prev.signos_vitales,
        values: { ...prev.signos_vitales.values, [vitalId]: value },
      },
    }));
  };

  const openModal = (modalId, moduleTitle) => {
    if (!MODALS[modalId]) {
      toast({ title: 'Modal no configurado.' });
      return;
    }
    setModuloActivo(moduleTitle || MODALS[modalId].title);
    setActiveModalId(modalId);
  };

  const closeModal = () => setActiveModalId(null);

  const onResolveAlert = (alertId) => {
    setSystemAlerts((prev) => prev.filter((item) => item.id !== alertId));
    toast({ title: 'Alerta resuelta correctamente.' });
  };

  const onSendAlert = async (priority, message, destination) => {
    if (!message || !message.trim()) {
      toast({ title: 'Escribe un mensaje para enviar la alerta.' });
      return;
    }

    try {
      // PASO 1: Guardar signos vitales en Firebase
      console.log('📋 [ALERTA] Guardando signos vitales antes de enviar alerta al médico...');
      const docId = await saveVitalSigns();
      
      if (!docId) {
        console.warn('⚠️ [ALERTA] No se guardaron los signos vitales, pero se enviará la alerta de todas formas.');
      } else {
        console.log('✅ [ALERTA] Signos vitales guardados exitosamente:', docId);
      }

      // PASO 2: Enviar la alerta al médico
      const levelMap = { urgente: 'critica', media: 'advertencia', baja: 'info', critica: 'critica', advertencia: 'advertencia', info: 'info' };
      const level = levelMap[priority] || 'info';
      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      setSystemAlerts((prev) => [
        { id: `a-${Date.now()}`, level, title: `Mensaje a ${destination}`, description: message, source: 'ENF', time: now },
        ...prev,
      ]);

      setAlertHistory((prev) => [
        { id: `h-${Date.now()}`, from: 'Enf. Guaman', to: destination, message, time: now },
        ...prev,
      ]);

      updateField('enviar_alerta', 'mensaje', '');
      
      console.log('✅ [ALERTA] Alerta enviada al médico:', { destination, message, priority });
      toast({ title: 'Signos vitales guardados + Alerta enviada al médico.' });
    } catch (error) {
      console.error('❌ [ALERTA] Error al procesar la alerta:', error);
      toast({ title: 'Error', description: 'Hubo un error al procesar la alerta.' });
    }
  };

  const handleSaveModal = async () => {
    const label = MODALS[activeModalId]?.title || 'Seccion';

    // Si es signos vitales, guardar en Firebase
    if (activeModalId === 'signos_vitales') {
      const success = await saveVitalSigns();
      if (success) {
        closeModal();
      }
      return;
    }

    // Para otros módulos (futuro): integración con otras subcolecciones
    toast({ title: `Guardado: ${label}`, description: 'Datos listos en state para futura sincronizacion con Firebase.' });
    closeModal();
  };

  const resumenVitales = VITALS_CONFIG.slice(0, 6).map((vital) => ({
    id: vital.id,
    label: vital.shortLabel,
    icon: vital.icon,
    iconClass: vital.iconClass,
    iconBgClass: vital.iconBgClass,
    value: `${forms.signos_vitales.values[vital.id]} ${vital.unit}`.trim(),
    alert: isVitalAlert(vital.id, forms.signos_vitales.values[vital.id]),
  }));

  const activeModal = activeModalId ? MODALS[activeModalId] : null;
  const ActiveModalContent = activeModal?.content || null;
  const ActiveModalIcon = activeModal?.icon || ClipboardList;

  const formattedDate = time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = time.toLocaleTimeString('es-ES');

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
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Logo Clinica Atlas"
                className="w-36 h-auto"
              />
              <p className="mt-1 text-sm font-bold text-[#1c3f6e]">{formattedTime}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#007e8f]">{formattedDate.toUpperCase()}</p>
            </div>
            {loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p className="font-bold text-sm text-[#1c3f6e]">{admisiones.firstName} {admisiones.lastName}</p>
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
              <p className="text-red-600 font-bold">No se encontro informacion de admisiones.</p>
            )}
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
                    className={`w-full text-left rounded-lg px-3 py-2 transition border ${historialActivo === index ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'}`}
                  >
                    <p className="font-semibold text-slate-700">{item.date}</p>
                    {item.note ? <p className="text-xs text-indigo-700">{item.note}</p> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="m-3 bg-[#d3efe9] rounded-lg p-4 text-sm text-gray-700">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-700">SIGNOS VITALES</h3>
                <button type="button" className="rounded-md bg-[#1c3f6e] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#007e8f]" onClick={() => openModal('signos_vitales', 'Signos Vitales')}>
                  + Registrar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {resumenVitales.map((vital) => {
                  const Icon = vital.icon;
                  return (
                    <button
                      key={vital.id}
                      type="button"
                      onClick={() => openModal('signos_vitales', 'Signos Vitales')}
                      className={`rounded-md px-2 py-1.5 text-left ${vital.alert ? 'bg-red-100 text-red-700' : 'bg-white text-slate-700'}`}
                    >
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase">
                        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-sm ${vital.iconBgClass}`}>
                          <Icon className={`h-3 w-3 ${vital.iconClass}`} />
                        </span>
                        {vital.label}
                      </p>
                      <p className="text-xs font-bold">{vital.value}</p>
                    </button>
                  );
                })}
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
                <h2 className="text-xl font-bold bg-[#162f5c] text-white inline-block px-4 py-2 rounded-full w-fit">MODULO ENFERMERIA</h2>
                <Badge className="w-fit bg-[#4b6bb3] text-white hover:bg-[#4b6bb3]">{moduloActivo ? `Modulo activo: ${moduloActivo}` : 'Selecciona un modulo'}</Badge>
              </div>

              {MODULO_ENFERMERIA_SECCIONES.map((section) => (
                <section key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">{section.title}</h3>
                    <span className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div className={`grid grid-cols-1 ${section.gridClass} gap-3`}>
                    {section.modules.map((module) => {
                      const Icon = module.icon;
                      return (
                        <button
                          type="button"
                          key={module.key}
                          onClick={() => openModal(module.modalId, module.title)}
                          className={`rounded-xl border p-3 text-left transition hover:shadow-md bg-white ${CARD_TONE_CLASSES[module.tone] || CARD_TONE_CLASSES.primary} ${moduloActivo === module.title ? 'ring-2 ring-[#4b6bb3] ring-offset-1' : 'ring-0'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${module.iconBgClass || 'bg-slate-100'}`}>
                              <Icon className={`h-5 w-5 ${module.iconClass || 'text-[#1c3f6e]'}`} />
                            </span>
                            {module.badge ? <Badge className={module.badgeClass}>{module.badge}</Badge> : null}
                          </div>
                          <h4 className="mt-2 text-sm font-bold text-slate-800">{module.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{module.description}</p>
                          <p className="text-[11px] font-semibold text-[#1c396b] mt-2">{module.status}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {activeModal ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-[96vw] max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between bg-[#1c3f6e] px-5 py-4 text-white">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${activeModal.iconBgClass || 'bg-white/20'}`}>
                    <ActiveModalIcon className={`h-4 w-4 ${activeModal.iconClass || 'text-white'}`} />
                  </span>
                  {activeModal.title}
                </h3>
                <button type="button" className="rounded-md bg-white/15 px-2 py-1 text-sm" onClick={closeModal}>✕</button>
              </div>
              <div className="max-h-[84vh] overflow-y-auto bg-[#f8fcff] p-5">
                {ActiveModalContent ? (
                  <ActiveModalContent
                    modalId={activeModalId}
                    forms={forms}
                    updateField={updateField}
                    updateVitalValue={updateVitalValue}
                    systemAlerts={systemAlerts}
                    alertHistory={alertHistory}
                    onResolveAlert={onResolveAlert}
                    onSendAlert={onSendAlert}
                  />
                ) : null}
              </div>
              <div className="flex justify-between gap-2 border-t border-[#007e8f]/20 bg-white px-5 py-3">
                <span className="text-[11px] text-slate-500">Draft Firebase listo: {Object.keys(firebaseDraft.payload?.forms || {}).length} secciones en memoria.</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeModal} disabled={isSavingFirebase}>Cerrar</Button>
                  {activeModal.showSave ? (
                    <Button
                      onClick={handleSaveModal}
                      disabled={isSavingFirebase}
                      className="bg-[#007e8f] text-white hover:bg-[#1c3f6e] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSavingFirebase ? '⏳ Guardando...' : 'Guardar'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default NurseModulePanel;
