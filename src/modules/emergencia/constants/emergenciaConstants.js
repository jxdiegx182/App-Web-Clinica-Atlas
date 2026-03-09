/**
 * Constantes y datos estatísticos para el módulo de Emergencia
 * Evita hardcodear data en componentes
 */

export const ANTECEDENTES_OPTIONS = [
  { num: 1, label: 'Alérgico' },
  { num: 2, label: 'Clínico' },
  { num: 3, label: 'Ginecológico' },
  { num: 4, label: 'Traumatológico' },
  { num: 5, label: 'Quirúrgico' },
  { num: 6, label: 'Farmacológico' },
  { num: 7, label: 'Psiquiátrico' },
  { num: 8, label: 'Otro' }
];

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

export const ALTA_OPTIONS = [
  { label: 'Domicilio', icon: '🏠', type: 'a' },
  { label: 'Consulta Externa', icon: '🏥', type: 'a' },
  { label: 'Observación', icon: '👁️', type: 'a' },
  { label: 'Internación', icon: '🛏️', type: 'a' },
  { label: 'Referencia', icon: '🔄', type: 'a' },
  { label: 'Muerto en Emergencia', icon: '☠️', type: 'b' }
];

export const GENERO_OPTIONS = ['', 'M', 'F'];

export const ESTADO_CIVIL_OPTIONS = ['', 'Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'];

export const INSTRUCCION_OPTIONS = ['', 'Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado'];

export const TIPO_SEGURO_OPTIONS = ['', 'IESS', 'ISSFA', 'ISSPOL', 'Privado', 'Particular', 'Sin seguro'];

export const GRUPO_SANGUINEO_OPTIONS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GLASGOW_OCULAR_OPTIONS = [
  { value: '', label: 'Seleccionar' },
  { value: '1', label: '1 - Sin apertura ocular' },
  { value: '2', label: '2 - Abre ojos al dolor' },
  { value: '3', label: '3 - Abre ojos a orden verbal' },
  { value: '4', label: '4 - Abre ojos espontáneamente' }
];

export const GLASGOW_VERBAL_OPTIONS = [
  { value: '', label: 'Seleccionar' },
  { value: '1', label: '1 - Sin respuesta' },
  { value: '2', label: '2 - Sonidos incomprensibles' },
  { value: '3', label: '3 - Palabras inapropiadas' },
  { value: '4', label: '4 - Desorientado' },
  { value: '5', label: '5 - Orientado' }
];

export const GLASGOW_MOTORA_OPTIONS = [
  { value: '', label: 'Seleccionar' },
  { value: '1', label: '1 - Sin respuesta' },
  { value: '2', label: '2 - Extensión al dolor' },
  { value: '3', label: '3 - Flexión al dolor' },
  { value: '4', label: '4 - Retira ante el dolor' },
  { value: '5', label: '5 - Localiza el dolor' },
  { value: '6', label: '6 - Obedece órdenes' }
];

/**
 * Interpretación de la escala de Glasgow
 */
export const GLASGOW_INTERPRETATIONS = {
  leve: { min: 13, max: 15, label: 'Leve', color: '#2e7d32', icon: '✅' },
  moderado: { min: 9, max: 12, label: 'Moderado', color: '#d69e2e', icon: '⚠️' },
  severo: { min: 0, max: 8, label: 'Severo', color: '#c8433a', icon: '🔴' }
};

/**
 * Utilidades para zonas del cuerpo
 */
export const getZoneName = (x, y) => {
  for (let z of BODY_ZONES) {
    if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) return z.name;
  }
  return 'Área no identificada';
};

/**
 * Opciones SI/NO para formularios
 */
export const SI_NO_OPTIONS = ['Sí', 'No'];

/**
 * Opciones de forma de llegada
 */
export const FORMA_LLEGADA_OPTIONS = ['Ambulatorio', 'Ambulancia', 'Otro transporte'];
