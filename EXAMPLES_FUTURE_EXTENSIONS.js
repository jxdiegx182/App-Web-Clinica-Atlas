/**
 * EJEMPLOS DE IMPLEMENTACIÓN - Subcolecciones Clínicas
 * 
 * Este archivo contiene ejemplos listos para copiar cuando desees
 * integrar otras subcolecciones además de signos vitales.
 */

// ============================================================
// EJEMPLO 1: GUARDAR NOTAS DE ENFERMERÍA
// ============================================================

export const saveNursingNotesExample = `
const saveNursingNotes = async () => {
  try {
    if (!mainId || !user) {
      toast({ title: 'Error', description: 'Datos insuficientes.' });
      return;
    }

    setIsSavingFirebase(true);

    const noteData = {
      turno: forms.informe_enf.turno,
      fecha: forms.informe_enf.fecha,
      estadoGeneral: forms.informe_enf.estadoGeneral,
      cuidados: forms.informe_enf.cuidados,
      novedades: forms.informe_enf.novedades,
    };

    const docId = await saveClinicalData('nursing_notes', noteData);

    if (docId) {
      // Limpiar formulario
      setForms(prev => ({
        ...prev,
        informe_enf: {
          turno: 'Manana 07:00-19:00',
          fecha: new Date().toISOString().slice(0, 10),
          estadoGeneral: '',
          cuidados: '',
          novedades: '',
        }
      }));
      closeModal();
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 2: GUARDAR REGISTRO DE MEDICACIÓN
// ============================================================

export const saveMedicationRecordsExample = `
const saveMedicationRecords = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const medData = {
      medicamento: forms.registro_med.medicamento,
      dosisVia: forms.registro_med.dosisVia,
      hora: forms.registro_med.hora,
      observaciones: forms.registro_med.observaciones,
      via: forms.registro_med.dosisVia.split('/')[1] || 'IV', // Extrae vía
    };

    const docId = await saveClinicalData('medication_records', medData);

    if (docId) {
      setForms(prev => ({
        ...prev,
        registro_med: {
          medicamento: '',
          dosisVia: '',
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          observaciones: '',
        }
      }));
      closeModal();
    }
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 3: GUARDAR REGISTRO DE OXÍGENO
// ============================================================

export const saveOxygenRecordsExample = `
const saveOxygenRecords = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const oxyData = {
      dispositivo: forms.registro_oxigeno.dispositivo,
      flujo: forms.registro_oxigeno.flujo ? Number(forms.registro_oxigeno.flujo) : null,
      fio2: forms.registro_oxigeno.fio2,
      satO2: forms.registro_oxigeno.sat ? Number(forms.registro_oxigeno.sat) : null,
      frecuenciaRespiratoria: forms.registro_oxigeno.fr ? Number(forms.registro_oxigeno.fr) : null,
      observaciones: forms.registro_oxigeno.nota,
    };

    await saveClinicalData('oxygen_records', oxyData);
    closeModal();
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 4: GUARDAR BALANCE DE FLUIDOS
// ============================================================

export const saveFluidBalanceExample = `
const saveFluidBalance = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const fluidData = {
      ingestaTotal: forms.ingesta_eliminacion.ingestaTotal ? Number(forms.ingesta_eliminacion.ingestaTotal) : 0,
      eliminacionTotal: forms.ingesta_eliminacion.eliminacionTotal ? Number(forms.ingesta_eliminacion.eliminacionTotal) : 0,
      balanceFinal: forms.ingesta_eliminacion.balanceFinal ? Number(forms.ingesta_eliminacion.balanceFinal) : 0,
      detalle: forms.ingesta_eliminacion.detalle,
      // Cálculo automático
      balanceCalculado: (
        Number(forms.ingesta_eliminacion.ingestaTotal || 0) - 
        Number(forms.ingesta_eliminacion.eliminacionTotal || 0)
      ),
    };

    await saveClinicalData('fluid_balance', fluidData);
    closeModal();
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 5: GUARDAR ÓRDENES DE DIETA
// ============================================================

export const saveDietOrdersExample = `
const saveDietOrders = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const dietData = {
      tipoDieta: forms.dietas.tipoDieta,
      restricciones: forms.dietas.restricciones,
      horarios: {
        desayuno: forms.dietas.desayuno,
        almuerzo: forms.dietas.almuerzo,
        merienda: forms.dietas.merienda,
      },
      indicaciones: forms.dietas.indicaciones,
      estado: 'activa', // Nuevo campo
    };

    await saveClinicalData('diet_orders', dietData);
    closeModal();
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 6: GUARDAR DESCARGO DE MEDICACIÓN
// ============================================================

export const saveMedicationDischargeExample = `
const saveMedicationDischarge = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const dischargeData = {
      medicamento: forms.descargo_med.medicamento,
      presentacion: forms.descargo_med.presentacion,
      cantidadUsada: Number(forms.descargo_med.cantidadUsada),
      cantidadDisponible: Number(forms.descargo_med.cantidadUsada), // O desde inventario
      motivo: forms.descargo_med.motivo,
      turno: forms.descargo_med.turno,
      enfermerraQuiDescarga: forms.descargo_med.enfermera,
    };

    await saveClinicalData('medication_discharge', dischargeData);
    closeModal();
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// EJEMPLO 7: GUARDAR REGISTROS HIDRATACIÓN IV
// ============================================================

export const saveHydrationRecordsExample = `
const saveHydrationRecords = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const hydrationData = {
      solucion: forms.hidratacion.solucion,
      volumen: Number(forms.hidratacion.volumen),
      aditivos: forms.hidratacion.aditivos,
      velocidad: Number(forms.hidratacion.velocidad),
      acceso: forms.hidratacion.acceso,
      observaciones: forms.hidratacion.observaciones,
      inicioAdministracion: new Date().toISOString(),
    };

    await saveClinicalData('hydration_records', hydrationData);
    closeModal();
  } finally {
    setIsSavingFirebase(false);
  }
};
`;

// ============================================================
// CÓMO INTEGRARLOS EN handleSaveModal()
// ============================================================

export const handleSaveModalIntegrationExample = `
const handleSaveModal = async () => {
  if (activeModalId === 'signos_vitales') {
    await saveVitalSigns();
  } else if (activeModalId === 'informe_enf') {
    await saveNursingNotes();
  } else if (activeModalId === 'registro_med') {
    await saveMedicationRecords();
  } else if (activeModalId === 'descargo_med') {
    await saveMedicationDischarge();
  } else if (activeModalId === 'ingesta_eliminacion') {
    await saveFluidBalance();
  } else if (activeModalId === 'hidratacion') {
    await saveHydrationRecords();
  } else if (activeModalId === 'registro_oxigeno') {
    await saveOxygenRecords();
  } else if (activeModalId === 'dietas') {
    await saveDietOrders();
  } else {
    // Para otros módulos (futuro)
    const label = MODALS[activeModalId]?.title || 'Seccion';
    toast({ title: \`Guardado: \${label}\` });
    closeModal();
  }
};
`;

// ============================================================
// ESTRUCTURA ESPERADA EN FIRESTORE DESPUÉS DE GUARDAR
// ============================================================

export const firestoreStructureAfterSave = `
admisiones/{admissionId}/
├── vital_signs/
│   ├── doc1 { presion, pulso, temperatura, ... }
│   ├── doc2 { presion, pulso, temperatura, ... }
│
├── nursing_notes/
│   ├── doc1 { turno, estadoGeneral, cuidados, ... }
│
├── medication_records/
│   ├── doc1 { medicamento, dosisVia, hora, ... }
│   ├── doc2 { medicamento, dosisVia, hora, ... }
│
├── oxygen_records/
│   ├── doc1 { dispositivo, flujo, satO2, ... }
│
├── fluid_balance/
│   ├── doc1 { ingestaTotal, eliminacionTotal, balance, ... }
│
├── diet_orders/
│   ├── doc1 { tipoDieta, restricciones, horarios, ... }
│
├── medication_discharge/
│   ├── doc1 { medicamento, cantidadUsada, turno, ... }
│
└── hydration_records/
    ├── doc1 { solucion, volumen, velocidad, ... }
\`;

// ============================================================
// CONSULTAS PARA LEER LOS DATOS (Futuro)
// ============================================================

export const queryExamples = \`
// Leer todos los signos vitales de una admisión
import { getDocs } from 'firebase/firestore';

const getVitalSigns = async (admissionId) => {
  const vitalsRef = collection(db, 'admisiones', admissionId, 'vital_signs');
  const querySnapshot = await getDocs(vitalsRef);
  
  const vitals = [];
  querySnapshot.forEach((doc) => {
    vitals.push({ id: doc.id, ...doc.data() });
  });
  
  return vitals;
};

// Leer en tiempo real (listener)
import { onSnapshot } from 'firebase/firestore';

const listenVitalSigns = (admissionId, callback) => {
  const vitalsRef = collection(db, 'admisiones', admissionId, 'vital_signs');
  
  const unsubscribe = onSnapshot(vitalsRef, (querySnapshot) => {
    const vitals = [];
    querySnapshot.forEach((doc) => {
      vitals.push({ id: doc.id, ...doc.data() });
    });
    callback(vitals);
  });
  
  return unsubscribe; // Para desuscribirse cuando sea necesario
};
`;
