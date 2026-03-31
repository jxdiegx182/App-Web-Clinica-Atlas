// ══════════════════════════════════════════════════════════════════
// DATA — Protocolo Operatorio Form. 017
// src/data/protocoloDB.js
// ══════════════════════════════════════════════════════════════════

// ── CIE-10 QUIRÚRGICO (subset del borrador) ──
export const CIE10_QUIRURGICO = [
  { c: 'K35',   d: 'Apendicitis aguda con peritonitis' },
  { c: 'K37',   d: 'Apendicitis, no especificada' },
  { c: 'K40.0', d: 'Hernia inguinal bilateral' },
  { c: 'K40.9', d: 'Hernia inguinal unilateral sin obstrucción' },
  { c: 'K41.9', d: 'Hernia femoral unilateral sin obstrucción' },
  { c: 'K43.0', d: 'Hernia ventral incisional' },
  { c: 'K43.9', d: 'Hernia ventral sin obstrucción' },
  { c: 'K80.0', d: 'Colelitiasis con colecistitis aguda' },
  { c: 'K80.2', d: 'Colelitiasis sin colecistitis' },
  { c: 'K81.0', d: 'Colecistitis aguda' },
  { c: 'K85.9', d: 'Pancreatitis aguda' },
  { c: 'K56.0', d: 'Íleo paralítico' },
  { c: 'K57.3', d: 'Enfermedad diverticular del intestino grueso' },
  { c: 'K92.1', d: 'Melena' },
  { c: 'S72.0', d: 'Fractura del cuello del fémur' },
  { c: 'S72.1', d: 'Fractura pertrocantérica' },
  { c: 'S82.0', d: 'Fractura de la rótula' },
  { c: 'S82.1', d: 'Fractura tibia proximal' },
  { c: 'S42.2', d: 'Fractura húmero proximal' },
  { c: 'M16.1', d: 'Coxartrosis primaria unilateral' },
  { c: 'M17.1', d: 'Gonartrosis primaria unilateral' },
  { c: 'M23.2', d: 'Trastorno de menisco' },
  { c: 'M75.1', d: 'Síndrome del manguito rotador' },
  { c: 'N20.0', d: 'Cálculo del riñón' },
  { c: 'N40',   d: 'Hiperplasia de la próstata' },
  { c: 'O82',   d: 'Parto por cesárea' },
  { c: 'C18.9', d: 'Tumor maligno del colon' },
  { c: 'C25.9', d: 'Tumor maligno del páncreas' },
  { c: 'C50.9', d: 'Tumor maligno de la mama' },
  { c: 'Z96.6', d: 'Presencia de artroplastia de rodilla' },
  { c: 'I25.1', d: 'Enfermedad aterosclerótica del corazón' },
  { c: 'I70.2', d: 'Aterosclerosis de arterias de extremidades' },
  { c: 'T84.0', d: 'Complicación mecánica de implante articular' },
  { c: 'Z96.4', d: 'Presencia de implante ortopédico' },
];

// ── CPT ──
export const CPT_DB = [
  { c: '44950', d: 'Apendicectomía' },
  { c: '44960', d: 'Apendicectomía con perforación o absceso' },
  { c: '44970', d: 'Apendicectomía laparoscópica' },
  { c: '47600', d: 'Colecistectomía' },
  { c: '47562', d: 'Colecistectomía laparoscópica' },
  { c: '47563', d: 'Colecistectomía laparoscópica con colangiografía' },
  { c: '49505', d: 'Reparación hernia inguinal, inicial' },
  { c: '49520', d: 'Reparación hernia inguinal, recurrente' },
  { c: '49560', d: 'Reparación hernia ventral incisional, inicial' },
  { c: '27130', d: 'Artroplastia total de cadera' },
  { c: '27447', d: 'Artroplastia total de rodilla' },
  { c: '27245', d: 'Tratamiento fractura femoral pertrocantérica con implante' },
  { c: '29881', d: 'Artroscopía de rodilla con meniscectomía' },
  { c: '29882', d: 'Artroscopía de rodilla con reparación de menisco' },
  { c: '23412', d: 'Reparación manguito rotador crónico' },
  { c: '50590', d: 'Litotripsia extracorpórea de cálculos renales' },
  { c: '52601', d: 'Resección transuretral de próstata (RTUP)' },
  { c: '59510', d: 'Parto por cesárea con tubaría' },
  { c: '59514', d: 'Parto por cesárea' },
  { c: '44140', d: 'Colectomía parcial' },
  { c: '48100', d: 'Biopsia de páncreas' },
  { c: '19120', d: 'Escisión de lesión de mama' },
  { c: '33533', d: 'CABG arterial, individual' },
  { c: '35301', d: 'Endarterectomía de arteria femoral' },
  { c: '43239', d: 'Gastroscopía con biopsia' },
  { c: '45378', d: 'Colonoscopía diagnóstica' },
  { c: '43280', d: 'Fundoplicatura laparoscópica' },
  { c: '49650', d: 'Laparoscopía diagnóstica' },
];

// ── INSUMOS POR CATEGORÍA ──
export const INSUMOS_DB = {
  instrumental: [
    'Bisturí hoja N°10', 'Bisturí hoja N°15', 'Bisturí hoja N°20', 'Bisturí hoja N°22',
    'Tijera de Mayo', 'Tijera de Metzenbaum', 'Tijera de Potts', 'Tijera de iris',
    'Electrobisturí monopolar', 'Electrobisturí bipolar', 'Bisturí ultrasónico (Harmonic)', 'LigaSure',
    'Pinza de Kelly', 'Pinza de Kocher', 'Pinza de Babcock', 'Pinza de Allis', 'Pinza de Rochester',
    'Pinza de Satinsky', 'Pinza de Duval', 'Pinza hemostática', 'Clamp intestinal', 'Clamp vascular',
    'Porta-agujas de Mayo-Hegar', 'Porta-agujas de Castroviejo', 'Porta-agujas de Heaney',
    'Separador de Farabeuf', 'Separador de Richardson', 'Valva de Doyen', 'Valva malleable',
    'Separador automático (Balfour)', 'Separador de Thompson', 'Separador de Weitlaner',
    'Cánula de aspiración Yankauer', 'Cánula de Poole',
    'Trocar laparoscópico 5mm', 'Trocar laparoscópico 10mm', 'Trocar laparoscópico 12mm',
    'Óptica laparoscópica 0°', 'Óptica laparoscópica 30°',
    'Aplicador de clip laparoscópico', 'Disector laparoscópico', 'Grasper laparoscópico',
  ],
  suturas: [
    'Vicryl 0-0', 'Vicryl 1-0', 'Vicryl 2-0', 'Vicryl 3-0', 'Vicryl 4-0',
    'Vicryl Plus 0-0', 'Vicryl Plus 2-0', 'Vicryl Plus 3-0',
    'Monocryl 3-0', 'Monocryl 4-0', 'Monocryl 5-0',
    'PDS 0-0', 'PDS 1-0', 'PDS 2-0', 'PDS 3-0',
    'Catgut simple 2-0', 'Catgut cromado 2-0', 'Catgut cromado 0-0',
    'Prolene 2-0', 'Prolene 3-0', 'Prolene 4-0', 'Prolene 5-0', 'Prolene 6-0',
    'Nylon 2-0', 'Nylon 3-0', 'Nylon 4-0', 'Nylon 5-0',
    'Mersilene 2-0', 'Seda trenzada 2-0', 'Seda trenzada 3-0',
    'Grapadora lineal GIA 60', 'Grapadora lineal GIA 80', 'Grapadora lineal GIA 100',
    'Grapadora circular EEA 21', 'Grapadora circular EEA 25', 'Grapadora circular EEA 28', 'Grapadora circular EEA 31',
    'Grapadora TA 30', 'Grapadora TA 60', 'Clip de titanio', 'Clip de Hem-o-lok',
  ],
  drenajes: [
    'Drenaje de Penrose', 'Drenaje de Blake 7mm', 'Drenaje de Blake 10mm',
    'Drenaje de Jackson-Pratt', 'Drenaje de Redón 10Fr', 'Drenaje de Redón 14Fr',
    'Tubo de Kher (en T biliar)', 'Tubo de tórax 28Fr', 'Tubo de tórax 32Fr',
    'Sonda Foley 12Fr', 'Sonda Foley 14Fr', 'Sonda Foley 16Fr', 'Sonda Foley 18Fr',
    'Sonda nasogástrica 12Fr', 'Sonda nasogástrica 14Fr', 'Sonda nasogástrica 16Fr',
    'Sonda de Levin', 'Sonda de Pezzar (cistostomía)',
    'Catéter epidural', 'Catéter venoso central', 'Catéter de presión arterial',
  ],
  hemostasia: [
    'Surgicel (celulosa oxidada)', 'Surgicel Fibrillar', 'Gelita / Gelfoam esponja',
    'Avitene (microfibras colágeno)', 'Floseal (trombina + gelatina)',
    'Tisseel (cola de fibrina)', 'Tachosil (esponja de fibrina)', 'Bone wax (cera de hueso)',
    'Argón plasma (APC)', 'Torniquete neumático', 'Torniquete isquémico manual',
    'LigaSure vessel sealer', 'Harmonic scalpel', 'EnSeal',
  ],
  implantes: [
    'Prótesis total de cadera cementada', 'Prótesis total de cadera no cementada',
    'Prótesis parcial de cadera (hemiartroplastia)', 'Prótesis total de rodilla',
    'Placa DHS (cadera)', 'Clavo endomedular femoral', 'Clavo endomedular tibial',
    'Placa de compresión dinámica (DCP)', 'Placa bloqueada LCP',
    'Tornillos canulados 6.5mm', 'Tornillos canulados 7.3mm',
    'Fijador externo unilateral', 'Fijador externo circular (Ilizarov)',
    'Malla de polipropileno', 'Malla biológica porcina', 'Malla absorbible Vicryl',
    'Plug herniario', 'Malla laparoscópica',
    'Prótesis de válvula aórtica', 'Injerto vascular Dacron', 'Injerto vascular PTFE',
  ],
  generales: [
    'Gasas 4x4 estériles', 'Gasas 10x10 estériles',
    'Compresas abdominales 30x30', 'Compresas abdominales 45x45',
    'Gasas hemostáticas', 'Apósito adhesivo', 'Tegaderm', 'Opsite',
    'Guantes estériles 6.0', 'Guantes estériles 6.5', 'Guantes estériles 7.0',
    'Guantes estériles 7.5', 'Guantes estériles 8.0',
    'Campos quirúrgicos estériles', 'Cubierta de mesa de Mayo',
    'Jeringa 5ml', 'Jeringa 10ml', 'Jeringa 20ml',
    'Aguja 18G', 'Aguja 21G', 'Catéter IV 18G', 'Catéter IV 20G',
    'Suero fisiológico 1000ml', 'Suero fisiológico 500ml',
    'Yodo povidona', 'Azul de metileno',
  ],
};

// Etiquetas y colores por categoría
export const CAT_LABELS = {
  instrumental: '✂️ Instrumental',
  suturas:      '🧵 Suturas',
  drenajes:     '🩺 Drenajes/Sondas',
  hemostasia:   '🩸 Hemostasia',
  implantes:    '🦴 Implantes',
  generales:    '📦 Generales',
};

export const CAT_COLORS = {
  instrumental: 'var(--navy)',
  suturas:      'var(--teal-d)',
  drenajes:     'var(--teal)',
  hemostasia:   'var(--red)',
  implantes:    'var(--purple)',
  generales:    'var(--amber)',
};

export const CAT_ICONS = {
  instrumental: '✂️',
  suturas:      '🧵',
  drenajes:     '🩺',
  hemostasia:   '🩸',
  implantes:    '🦴',
  generales:    '📦',
};

// ── PATÓLOGOS ──
export const PATOLOGOS = [
  { id: 'p1', nombre: 'Dr. Carlos Mendoza Vargas',  especialidad: 'Patología Quirúrgica',  email: 'c.mendoza@patologia.ec',  turno: 'Mañana' },
  { id: 'p2', nombre: 'Dra. María Elena Suárez',    especialidad: 'Citopatología',         email: 'm.suarez@patologia.ec',   turno: 'Mañana' },
  { id: 'p3', nombre: 'Dr. Rodrigo Andrade Pinto',  especialidad: 'Neuropatología',        email: 'r.andrade@patologia.ec',  turno: 'Tarde'  },
  { id: 'p4', nombre: 'Dra. Lucía Flores Castillo', especialidad: 'Patología Oncológica',  email: 'l.flores@patologia.ec',   turno: 'Tarde'  },
  { id: 'p5', nombre: 'Dr. Jorge Herrera Toapanta', especialidad: 'Patología General',     email: 'j.herrera@patologia.ec',  turno: 'Noche'  },
  { id: 'p6', nombre: 'Dra. Andrea Vega Rodríguez', especialidad: 'Inmunohistoquímica',    email: 'a.vega@patologia.ec',     turno: 'Mañana' },
];

// ── STAFF MÉDICO (buscador de equipo) ──
// En producción: reemplazar con endpoint GET /api/staff
export const STAFF_DB = [
  { id: 'dr001', nombre: 'Dr. Rafael Aguirre Torres',    especialidad: 'Cirugía General',          matricula: 'SEN-1234' },
  { id: 'dr002', nombre: 'Dr. Andrés Cevallos Mora',     especialidad: 'Cirugía Laparoscópica',    matricula: 'SEN-2345' },
  { id: 'dr003', nombre: 'Dra. Carmen Flores Andrade',   especialidad: 'Cirugía Oncológica',       matricula: 'SEN-3456' },
  { id: 'dr004', nombre: 'Dr. Luis Herrera Pinto',       especialidad: 'Traumatología',            matricula: 'SEN-4567' },
  { id: 'dr005', nombre: 'Dra. Valeria Jara Rodríguez',  especialidad: 'Anestesiología',           matricula: 'SEN-5678' },
  { id: 'dr006', nombre: 'Dr. Marco Naranjo Vega',       especialidad: 'Anestesiología',           matricula: 'SEN-6789' },
  { id: 'dr007', nombre: 'Dra. Patricia Ortega Lema',    especialidad: 'Cirugía Plástica',         matricula: 'SEN-7890' },
  { id: 'dr008', nombre: 'Dr. Sebastián Rojas Castro',   especialidad: 'Neurocirugía',             matricula: 'SEN-8901' },
  { id: 'dr009', nombre: 'Dra. Isabel Suárez Montoya',   especialidad: 'Ginecología y Obstetricia',matricula: 'SEN-9012' },
  { id: 'dr010', nombre: 'Dr. Fernando Torres Quispe',   especialidad: 'Urología',                 matricula: 'SEN-0123' },
  { id: 'dr011', nombre: 'Dra. Alicia Vargas Mejía',     especialidad: 'Pediatría Quirúrgica',     matricula: 'SEN-1235' },
  { id: 'dr012', nombre: 'Dr. Gustavo Zambrano León',    especialidad: 'Cirugía Cardiovascular',   matricula: 'SEN-2346' },
];

// ── OPCIONES DE TIPO DE CIRUGÍA Y ANESTESIA ──
export const TIPOS_CIRUGIA = [
  { value: 'electiva',   label: '📅 ELECTIVA',    cls: 'electiva' },
  { value: 'emergencia', label: '🚨 EMERGENCIA',  cls: 'emergencia' },
];

export const TIPOS_ANESTESIA = [
  { value: 'General',     label: '💉 General'      },
  { value: 'Conductiva',  label: '🩻 Conductiva'   },
  { value: 'Bloqueo',     label: '🎯 Bloqueo'      },
  { value: 'Sedación',    label: '😴 Sedación'     },
];

// ── SECCIONES NARRATIVAS ──
export const NARRACION_SECTIONS = [
  {
    key:  'dieresis',
    num:  'I',
    title: 'Diéresis — Acceso y Apertura',
    placeholder: 'Tipo de incisión, acceso quirúrgico, apertura de planos: piel, TCSC, fascia, músculo, peritoneo. Localización, longitud, dirección y hemostasia...',
  },
  {
    key:  'exposicion',
    num:  'II',
    title: 'Exposición — Visualización del Campo',
    placeholder: 'Maniobras de exposición: separación de órganos, uso de valvas, retractores, tracción. Estructuras anatómicas visualizadas...',
    style: {},
  },
  {
    key:  'exploracion',
    num:  'III',
    title: 'Exploración y Hallazgos Quirúrgicos',
    placeholder: 'Hallazgos intraoperatorios: condición del órgano objetivo, estructuras adyacentes, sangrado, adherencias, lesiones, dimensiones, características macroscópicas...',
    style: { minHeight: 120 },
  },
  {
    key:  'procedimiento',
    num:  'IV',
    title: 'Procedimiento Operatorio',
    placeholder: 'Paso a paso del procedimiento: técnica quirúrgica, maniobras, ligaduras, suturas, resecciones, anastomosis, drenajes, implantes...',
    style: { minHeight: 150 },
  },
  {
    key:  'sintesis',
    num:  'V',
    title: 'Síntesis — Cierre por Planos',
    placeholder: 'Cierre por planos: peritoneo, fascia, músculo, TCSC, piel. Tipo de sutura, material, técnica, drenajes, apósitos...',
  },
];

// ── URGENCIA DE PATOLOGÍA ──
export const URGENCIA_PATOLOGIA = [
  { value: 'rutina',      label: '🟢 Rutina (24-48h)' },
  { value: 'prioritaria', label: '🟡 Prioritaria (12h)' },
  { value: 'urgente',     label: '🔴 Urgente (intraoperatoria)' },
];

// ── CONFIGS IA (labels) ──
export const IA_BUTTONS = [
  { type: 'alertas',    icon: '🚨', title: 'Alertas y Errores',      desc: 'Detecta inconsistencias y riesgos de seguridad quirúrgica' },
  { type: 'cie_verify', icon: '🔵', title: 'Verificar CIE-10',       desc: 'Valida los códigos CIE-10 vs procedimiento y diagnóstico' },
  { type: 'cpt_verify', icon: '🟢', title: 'Verificar CPT',          desc: 'Valida códigos CPT y sugiere procedimientos omitidos' },
  { type: 'resumen',    icon: '📋', title: 'Resumen Operatorio',      desc: 'Genera resumen ejecutivo del protocolo quirúrgico' },
  { type: 'alergia',    icon: '⚠️', title: 'Control de Alergias',    desc: 'Verifica compatibilidad con alergias registradas' },
  { type: 'protocolo',  icon: '✅', title: 'Revisión de Protocolo',  desc: 'Evalúa completitud y calidad de la documentación' },
];

// ── MAPA DE ALERTAS IA ──
export const ALERT_MAP = {
  critico:     { cls: 'ar-critical', bcls: 'b-crit',  icon: '🔴', lbl: 'CRÍTICO'     },
  advertencia: { cls: 'ar-warning',  bcls: 'b-warn',  icon: '⚠️', lbl: 'ADVERTENCIA' },
  info:        { cls: 'ar-info',     bcls: 'b-info',  icon: 'ℹ️', lbl: 'INFO'        },
  ok:          { cls: 'ar-ok',       bcls: 'b-ok',    icon: '✅', lbl: 'OK'          },
};
