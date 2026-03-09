/**
 * EMERGENCIA - CONSTANTES MÉDICAS
 * Datos estáticos para formularios de emergencia
 */

// ANTECEDENTES PERSONALES
export const ANTECEDENTES = [
  { num: 1, label: 'Alérgico' },
  { num: 2, label: 'Clínico' },
  { num: 3, label: 'Ginecológico' },
  { num: 4, label: 'Traumatológico' },
  { num: 5, label: 'Quirúrgico' },
  { num: 6, label: 'Farmacológico' },
  { num: 7, label: 'Psiquiátrico' },
  { num: 8, label: 'Otro' }
];

// REGIONES DEL EXAMEN FÍSICO CP/SP
export const EXAM_REGIONS = [
  '1. Vía Aérea Obstruida', 
  '2. Cabeza', 
  '3. Cuello', 
  '4. Tórax',
  '5. Abdomen', 
  '6. Columna', 
  '7. Pelvis', 
  '8. Extremidades'
];

// TIPOS DE LESIONES
export const LESION_TYPES = [
  { n: 1, label: 'Herida Penetrante' }, 
  { n: 2, label: 'Herida Cortante' },
  { n: 3, label: 'Fractura Expuesta' }, 
  { n: 4, label: 'Fractura Cerrada' },
  { n: 5, label: 'Cuerpo Extraño' }, 
  { n: 6, label: 'Hemorragia' },
  { n: 7, label: 'Mordedura' }, 
  { n: 8, label: 'Picadura' },
  { n: 9, label: 'Excoriación' }, 
  { n: 10, label: 'Deformidad o Masa' },
  { n: 11, label: 'Hematoma' }, 
  { n: 12, label: 'Eritema / Inflamación' },
  { n: 13, label: 'Luxación / Esguince' }, 
  { n: 14, label: 'Quemadura' },
  { n: 15, label: 'Otro' }
];

// ZONAS DEL CUERPO PARA MAPEO DE LESIONES
export const BODY_ZONES = [
  { name: 'Cabeza', x: [38, 82], y: [0, 50] },
  { name: 'Cuello', x: [46, 74], y: [50, 62] },
  { name: 'Tórax', x: [18, 102], y: [62, 130] },
  { name: 'Brazo Der', x: [6, 28], y: [62, 140] },
  { name: 'Brazo Izq', x: [92, 114], y: [62, 140] },
  { name: 'Antebrazo Der', x: [8, 28], y: [140, 198] },
  { name: 'Antebrazo Izq', x: [92, 112], y: [140, 198] },
  { name: 'Mano Der', x: [6, 26], y: [198, 222] },
  { name: 'Mano Izq', x: [94, 114], y: [198, 222] },
  { name: 'Cadera/Pelvis', x: [18, 102], y: [130, 170] },
  { name: 'Muslo Der', x: [22, 50], y: [170, 232] },
  { name: 'Muslo Izq', x: [70, 98], y: [170, 232] },
  { name: 'Pierna Der', x: [20, 44], y: [232, 280] },
  { name: 'Pierna Izq', x: [76, 100], y: [232, 280] }
];

// EXÁMENES DE LABORATORIO/IMAGEN
export const EXAM_LIST = [
  { n: 1, label: '1. Biometría' }, 
  { n: 2, label: '2. Uroanálisis' },
  { n: 3, label: '3. Química Sanguínea' }, 
  { n: 4, label: '4. Electrolitos' },
  { n: 5, label: '5. Gasometría' }, 
  { n: 6, label: '6. Electrocardiograma' },
  { n: 7, label: '7. Endoscopía' }, 
  { n: 8, label: '8. R-X Tórax' },
  { n: 9, label: '9. R-X Abdomen' }, 
  { n: 10, label: '10. R-X Ósea' },
  { n: 11, label: '11. Tomografía' }, 
  { n: 12, label: '12. Resonancia' },
  { n: 13, label: '13. Ecografía Pélvica' }, 
  { n: 14, label: '14. Ecografía Abdomen' },
  { n: 15, label: '15. Interconsulta' }, 
  { n: 16, label: '16. Otros' }
];

// OPCIONES DE ALTA
export const ALTA_OPTIONS = [
  { label: 'Domicilio', icon: '🏠', type: 'a' },
  { label: 'Consulta Externa', icon: '🏥', type: 'a' },
  { label: 'Observación', icon: '👁️', type: 'a' },
  { label: 'Internación', icon: '🛏️', type: 'a' },
  { label: 'Referencia', icon: '🔄', type: 'a' },
  { label: 'Muerto en Emergencia', icon: '☠️', type: 'b' }
];

// OPCIONES DE SELECCIÓN COMUNES
export const SELECT_OPTIONS = {
  genero: ['', 'M', 'F'],
  estadoCivil: ['', 'Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'],
  instruccion: ['', 'Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'],
  tipoSeguro: ['', 'IESS', 'ISSFA', 'ISSPOL', 'Privado', 'Particular', 'Sin seguro'],
  grupoSanguineo: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  formaLlegada: ['Ambulatorio', 'Ambulancia', 'Otro transporte'],
  trauma: ['Sí', 'No'],
  notificacionPolicia: ['Sí', 'No'],
  custodia: ['Sí', 'No'],
  aliento: ['Positivo', 'Negativo'],
  viaAerea: ['libre', 'obstruida'],
  condicion: ['estable', 'inestable'],
};

// VALOR INICIAL DEL FORMULARIO
export const INITIAL_FORM_DATA = {
  // INSTITUCIÓN
  institucion: '', 
  unidadOperativa: '', 
  codUO: '', 
  parroquiaInst: '', 
  cantonInst: '', 
  historiaClinica: '',

  // ADMISIÓN
  apellidoPaterno: '', 
  apellidoMaterno: '', 
  primerNombre: '', 
  segundoNombre: '', 
  cedula: '',
  direccion: '', 
  barrio: '', 
  parroquia: '', 
  canton: '', 
  provincia: '', 
  telefono: '',
  fechaNacimiento: '', 
  lugarNacimiento: '', 
  nacionalidad: 'Ecuador', 
  edad: '',
  genero: '', 
  estadoCivil: '', 
  instruccion: '', 
  grupoOEtnia: '',
  fechaAdmision: '', 
  ocupacion: '', 
  empresa: '', 
  tipoSeguro: '',
  referenciaOrigen: '', 
  contactoEmergencia: '', 
  dirContacto: '', 
  telContacto: '',
  formaLlegada: '', 
  fuenteInfo: '', 
  institucionEntrega: '', 
  telEntrega: '',

  // MOTIVO
  horaAtencion: '', 
  trauma: '', 
  causaClin: '', 
  causaObst: '', 
  causaQuir: '',
  grupoSanguineo: '', 
  notificacionPolicia: '', 
  otroMotivo: '', 
  custodia: '',

  // ACCIDENTE
  fechaEvento: '', 
  lugarEvento: '', 
  direccionEvento: '',
  tiposEvento: [], 
  aliento: '', 
  alcocheck: '', 
  obsAccidente: '',

  // ANTECEDENTES
  antecedentes: {}, 
  antecedentesDescs: {},

  // ENFERMEDAD
  viaAerea: '', 
  condicion: '', 
  cronologia: '', 
  localizacion: '', 
  intensidad: '', 
  factoresAgravan: '',

  // VITALES
  vitales: { 
    pa: '', 
    fc: '', 
    fr: '', 
    tempBucal: '', 
    tempAxilar: '', 
    peso: '', 
    talla: '', 
    saturacion: '' 
  },
  glasgowOcular: '', 
  glasgowVerbal: '', 
  glasgowMotora: '',
  pupilaDer: '', 
  pupilaIzq: '', 
  llenado: '',

  // EXAMEN FÍSICO
  cpsp: {},

  // LESIONES
  activeLesionType: null, 
  lesiones: [],

  // OBSTÉTRICA
  gestas: '', 
  partos: '', 
  abortos: '', 
  cesareas: '', 
  fum: '', 
  semanas: '',
  movFetal: '', 
  fcFetal: '', 
  membranas: '', 
  tiempoRotura: '', 
  alturaUterina: '',
  presentacion: '', 
  dilatacion: '', 
  borramiento: '', 
  plano: '', 
  pelvisUtil: '',
  sangradoVaginal: '', 
  contracciones: '',

  // EXÁMENES
  examenesMarcados: new Set(), 
  comentariosExamenes: '',

  // DIAGNÓSTICOS
  diagIngreso: [], 
  diagAlta: [],

  // TRATAMIENTO
  indicacionesGenerales: '', 
  medicamentos: [],

  // ALTA
  destino: '', 
  condicionAlta: '', 
  diasIncapacidad: '', 
  servicioRef: '', 
  establecimientoRef: '',
  egresa: '', 
  causaMuerte: '', 
  codigoMuerte: '', 
  fechaAlta: '', 
  horaAlta: '', 
  profesional: '', 
  numeroHoja: ''
};
