import { fechaKey } from '../utils/parteOperatorioUtils';

export const ADMIN_PIN = '2024';

export const SN = {
  0: 'Todas las Salas',
  1: 'Sala Operación 1',
  2: 'Sala Operación 2',
  3: 'Sala Operación 3',
  4: 'Sala Operación 4',
  5: 'Hospitalización Día',
  6: 'Endoscopía',
};

export const SS = { 0: 'Todas', 1: 'S.1', 2: 'S.2', 3: 'S.3', 4: 'S.4', 5: 'H.Día', 6: 'Endosc.' };

export const ESTADOS = {
  programado: { lbl: 'Programado',  icon: '🗓', cls: 'est-programado' },
  en_curso:   { lbl: 'En Curso',    icon: '🔄', cls: 'est-en_curso'   },
  completado: { lbl: 'Completado',  icon: '✅', cls: 'est-completado' },
  cancelado:  { lbl: 'Cancelado',   icon: '❌', cls: 'est-cancelado'  },
  pendiente:  { lbl: 'Pendiente',   icon: '⏸', cls: 'est-pendiente'  },
};

export const TIPOS_CX = ['Laparoscópica', 'Abierta', 'Endoscopía', 'Robótica', 'Ambulatoria'];

export const PACIENTES_DB = [
  { id: 'P001', nom: 'TORRES FERNÁNDEZ, FERNANDA PATRICIA', edad: 40, cedula: '1712345678', tel: '0999000001', email: 'fernanda@example.com', alergias: 'Penicilina' },
  { id: 'P002', nom: 'ANDRADE MORA, PABLO SEBASTIÁN',       edad: 21, cedula: '1756781234', tel: '0999000002', email: 'pablo@example.com',    alergias: ''           },
  { id: 'P003', nom: 'SUÁREZ CABRERA, MARÍA ELENA',         edad: 63, cedula: '1798765432', tel: '0999000003', email: 'maria@example.com',    alergias: 'AINEs'      },
];

export const MEDICOS_DB = [
  { id: 'M001', nom: 'DR. VALDEZ',  esp: 'Ginecología y Obstetricia',  tel: '0999000011', email: 'valdez@atlas.com'  },
  { id: 'M002', nom: 'DR. PICOITA', esp: 'Anestesiología',             tel: '0999000012', email: 'picoita@atlas.com' },
  { id: 'M003', nom: 'DR. ANDRADE', esp: 'Cirugía General',            tel: '0999000013', email: 'andrade@atlas.com' },
  { id: 'M004', nom: 'DR. MORA',    esp: 'Anestesiología',             tel: '0999000014', email: 'mora@atlas.com'    },
  { id: 'M005', nom: 'DR. CABRERA', esp: 'Cirugía General — Ayudante', tel: '0999000015', email: 'cabrera@atlas.com' },
  { id: 'M006', nom: 'DR. ALBUJA',  esp: 'Traumatología',              tel: '0999000016', email: 'albuja@atlas.com'  },
  { id: 'M007', nom: 'DR. MÉNDEZ',  esp: 'Gastroenterología',          tel: '0999000017', email: 'mendez@atlas.com'  },
];

export const HOY = fechaKey(new Date());

export let demoIdCounter = 0;

export const DEMO_REGISTROS = [
  { hora: '07:00', sala: 1, nom: 'FERNANDA TORRES', edad: 40, cir: 'CESÁREA',        dr: 'DR. VALDEZ',  ayu: 'DR. CABRERA', ane: 'DR. PICOITA', tipo: 'Abierta',        tpo: 1,   obs: 'ORH+',    estado: 'completado', tel_pac: '0999000001', tel_dr: '0999000011', email_pac: 'fernanda@example.com', email_dr: 'valdez@atlas.com'  },
  { hora: '11:30', sala: 2, nom: 'PABLO ANDRADE',   edad: 21, cir: 'TOBILLOPLASTIA', dr: 'DR. PICOITA', ayu: 'DR. ALBUJA',  ane: 'DR. MORA',    tipo: 'Laparoscópica', tpo: 1,   obs: 'ORH+',    estado: 'en_curso',   tel_pac: '0999000002', tel_dr: '0999000012', email_pac: 'pablo@example.com',    email_dr: 'picoita@atlas.com' },
  { hora: '11:30', sala: 4, nom: 'PABLO ANDRADE',   edad: 21, cir: 'TOBILLOPLASTIA', dr: 'DR. PICOITA', ayu: 'DR. ALBUJA',  ane: 'DR. MORA',    tipo: 'Laparoscópica', tpo: 1,   obs: 'ORH+',    estado: 'programado', tel_pac: '0999000002', tel_dr: '0999000012', email_pac: 'pablo@example.com',    email_dr: 'picoita@atlas.com' },
  { hora: '14:30', sala: 3, nom: 'MARÍA SUÁREZ',    edad: 63, cir: 'TOBILLOPLASTIA', dr: 'DR. ANDRADE', ayu: 'DR. CABRERA', ane: 'DR. MORA',    tipo: 'Abierta',        tpo: 2,   obs: '',        estado: 'pendiente',  tel_pac: '0999000003', tel_dr: '0999000013', email_pac: 'maria@example.com',    email_dr: 'andrade@atlas.com' },
  { hora: '07:00', sala: 3, nom: 'MARÍA SUÁREZ',    edad: 63, cir: 'TOBILLOPLASTIA', dr: 'DR. ANDRADE', ayu: 'DR. CABRERA', ane: 'DR. MORA',    tipo: 'Abierta',        tpo: 2,   obs: '',        estado: 'programado', tel_pac: '0999000003', tel_dr: '0999000013', email_pac: 'maria@example.com',    email_dr: 'andrade@atlas.com' },
  { hora: '09:00', sala: 6, nom: 'JORGE RIVERA',    edad: 55, cir: 'COLONOSCOPÍA',   dr: 'DR. MÉNDEZ',  ayu: '',            ane: 'DR. PICOITA', tipo: 'Endoscopía',     tpo: 0.5, obs: 'Sedación', estado: 'cancelado',  tel_pac: '0999000004', tel_dr: '0999000014', email_pac: 'jorge@example.com',    email_dr: 'mendez@atlas.com'  },
].map((d) => ({ ...d, id: ++demoIdCounter, fecha: HOY, ped: '', cedula: '', pac_id: null }));

export const FORM_VACIO = {
  fecha: HOY, hora: '07:00', sala: 1,
  nom: '', edad: '', cedula: '', pac_id: null,
  cir: '', dr: '', ayu: '', ane: '', ped: '',
  tipo: 'Laparoscópica', tpo: 1, obs: '',
  tel_pac: '', tel_dr: '', email_pac: '', email_dr: '',
};

export const HORAS_GRID = [];
for (let h = 7; h <= 19; h++) {
  HORAS_GRID.push(`${h}:00`);
  HORAS_GRID.push(`${h}:30`);
}
